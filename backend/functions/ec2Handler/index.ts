import { DynamoDBStreamEvent } from 'aws-lambda';
import { EC2Client, RunInstancesCommand } from '@aws-sdk/client-ec2';
// import { SSMClient } from '@aws-sdk/client-ssm';

export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
    const ec2Client = new EC2Client({});
    for (const record of event.Records) {
        if (record.eventName === 'INSERT') {
            const instanceInfo = record.dynamodb?.NewImage;
            const itemId = instanceInfo?.id?.S;
            const userDataScript = Buffer.from(`
                #!/bin/bash
                yum update -y
                yum install -y aws-cli jq
                aws configure set default.region ${process.env.AWS_REGION}
                # Fetch item details from DynamoDB
                DATA=$(aws dynamodb get-item --table-name MetadataTable --key '{"id": {"S": "${itemId}"}}')
                FILE_PATH=$(echo $DATA | jq -r '.Item.filePath.S')
                INPUT_TEXT=$(echo $DATA | jq -r '.Item.inputText.S')
                OUTPUT_FILE_NAME=$(echo $DATA | jq -r '.Item.OutputFileName.S')

                # Download file from S3
                aws s3 cp s3://$FILE_PATH /tmp/input-file

                # Append text to the file
                echo "$INPUT_TEXT" >> /tmp/input-file

                # Upload the modified file back to S3
                BUCKET_NAME=$(echo $FILE_PATH | cut -d'/' -f1)
                aws s3 cp /tmp/input-file s3://$BUCKET_NAME/$OUTPUT_FILE_NAME

                # Self-terminate the EC2 instance
                INSTANCE_ID=$(curl http://169.254.169.254/latest/meta-data/instance-id)
                aws ec2 terminate-instances --instance-ids $INSTANCE_ID
            `).toString('base64');

            try {
                const runInstancesCommand = new RunInstancesCommand({
                    ImageId: 'ami-0ddda618e961f2270',
                    InstanceType: 't2.micro',
                    MinCount: 1,
                    MaxCount: 1,
                    UserData: userDataScript,
                    IamInstanceProfile: {
                        Arn: process.env.INSTANCE_PROFILE_ARN as string,
                    },
                });

                await ec2Client.send(runInstancesCommand);
                console.log(`Instance launched with Item ID: ${itemId}`);
            } catch (error) {
                console.error("Error launching EC2 instance:", error);
            }
        }
    }
};
