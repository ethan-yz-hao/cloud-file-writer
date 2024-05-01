import axios from 'axios';

const uploadFileToS3 = async (file: File): Promise<{ success: boolean, message: string, filePath?: string }> => {
    try {
        const apiUrl = import.meta.env.VITE_API_URL + '/get-presigned-url';
        const response = await axios.post(apiUrl, {
            key: file.name
        });

        const {url, fields} = response.data;

        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
            if (typeof value === 'string' || value instanceof Blob) {
                formData.append(key, value);
            } else {
                console.error(`Unexpected type for field: ${key}`);
            }
        });
        formData.append('file', file);

        const uploadResponse = await axios.post(url, formData);

        if (uploadResponse.status === 204) {
            const extractBucketNameFromUrl = (url: string): string => {
                const parsedUrl = new URL(url);
                const hostname = parsedUrl.hostname;
                const parts = hostname.split('.');
                const bucketName = parts[0];
                return bucketName;
            }

            const bucketName = extractBucketNameFromUrl(url);
            const filePath = bucketName + '/' + fields.key;
            return {success: true, message: 'File uploaded successfully', filePath};
        } else {
            return {success: false, message: 'Upload failed'};
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error uploading file to S3: ', error.message);
            return {success: false, message: error.message};
        } else {
            console.error('Unexpected error uploading file to S3');
            return {success: false, message: 'Unexpected error'};
        }
    }
};

export default uploadFileToS3;