import { DynamoDBStreamEvent } from 'aws-lambda';
import { EC2Client, RunInstancesCommand } from '@aws-sdk/client-ec2';

export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
    const ec2Client = new EC2Client({});
    for (const record of event.Records) {
        if (record.eventName === 'INSERT') {
            const instanceInfo = record.dynamodb?.NewImage;
            const itemId = instanceInfo?.id?.S;
            const userDataScript = Buffer.from(`#!/bin/bash
exec > /tmp/userdata.log 2>&1
set -ex
echo "Starting UserData script execution"

export TABLE_NAME=${process.env.TABLE_NAME}
export BUCKET_NAME=${process.env.BUCKET_NAME}
export AWS_REGION=${process.env.AWS_REGION}
export ITEM_ID=${itemId}

aws configure set default.region $AWS_REGION

aws s3 cp s3://$BUCKET_NAME/process_data.sh /tmp/process_data.sh
chmod +x /tmp/process_data.sh

/tmp/process_data.sh

TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 600")
INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id)
aws ec2 terminate-instances --instance-ids $INSTANCE_ID
            `).toString('base64');

            try {
                console.log(`Script for instance ${itemId}: ${userDataScript}`);
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

                const res = await ec2Client.send(runInstancesCommand);
                console.log(res);
                console.log(`Instance launched with Item ID: ${itemId}`);
            } catch (error) {
                console.error("Error launching EC2 instance:", error);
            }
        }
    }
};
