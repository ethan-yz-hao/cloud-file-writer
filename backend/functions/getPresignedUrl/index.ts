import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const s3Client = new S3Client({ region: "us-east-2" });

export const handler = async (event: { body: string }): Promise<any> => {
    const { key, expiresInSeconds = 1000, conditions = [] } = JSON.parse(event.body);

    const Conditions = [
        ...conditions,
        ['content-length-range', 0, 10485760]
    ];

    const Fields = {
        'Content-Type': 'multipart/form-data'
    };

    const bucketName = process.env.BUCKET_NAME as string;
    const options = {
        Bucket: bucketName,
        Key: key,
        Conditions,
        Fields,
        Expires: expiresInSeconds
    };

    try {
        const { url, fields } = await createPresignedPost(s3Client, options);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
            },
            body: JSON.stringify({
                url: url,
                fields: fields
            })
        };
    } catch (err: unknown) {
        console.error("Error creating pre-signed POST URL: ", err);
        if (err instanceof Error) {
            return {
                statusCode: 500,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ message: "Failed to create pre-signed URL", error: err.message })
            };
        } else {
            return {
                statusCode: 500,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ message: "Failed to create pre-signed URL", error: "An unknown error occurred" })
            };
        }
    }
};
