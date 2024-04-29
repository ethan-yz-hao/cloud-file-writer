import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });

interface Metadata {
    id: string;
    inputText: string;
    fileName: string;
    filePath: string;
}

exports.handler = async (event: { body: string }): Promise<any> => {
    const { id, inputText, fileName, filePath }: Metadata = JSON.parse(event.body);

    const item = {
        id: { S: id },
        inputText: { S: inputText },
        fileName: { S: fileName },
        filePath: { S: filePath }
    };

    const params = {
        TableName: "YourTableNameHere",
        Item: marshall(item)
    };

    try {
        const data = await client.send(new PutItemCommand(params));
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Data saved successfully", data })
        };
    } catch (err) {
        console.error("DynamoDB error: ", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to save data", error: err })
        };
    }
};
