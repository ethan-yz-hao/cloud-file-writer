import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const s3Client = new S3Client({ region: "us-east-1" });

exports.handler = async (event: { body: string }): Promise<any> => {
    const { bucketName, key, expiresInSeconds = 300, conditions = [] } = JSON.parse(event.body);

    const Conditions = [
        ...conditions,
        ['content-length-range', 0, 10485760]
    ];

    const Fields = {
        'Content-Type': 'multipart/form-data'
    };

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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                url: url,
                fields: fields
            })
        };
    } catch (err) {
        console.error("Error creating pre-signed POST URL: ", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to create pre-signed URL", error: err.toString() })
        };
    }
};
