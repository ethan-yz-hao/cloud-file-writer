import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { nanoid } from "nanoid";
export const handler = async (event) => {
    const client = new DynamoDBClient({ region: "us-east-2" });
    const { inputText, OutputFileName, filePath } = JSON.parse(event.body);
    const id = nanoid();
    const item = {
        id,
        inputText,
        OutputFileName,
        filePath
    };
    const params = {
        TableName: process.env.TABLE_NAME,
        Item: marshall(item)
    };
    try {
        const data = await client.send(new PutItemCommand(params));
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
            },
            body: JSON.stringify({ message: "Data saved successfully", data }),
        };
    }
    catch (err) {
        console.error("DynamoDB error: ", err);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ message: "Failed to save data", error: err })
        };
    }
};
