import axios from 'axios';

const uploadFileToS3 = async (file: File): Promise<{ success: boolean, message: string }> => {
    try {
        const response = await axios.post('https://1mbeiz85q3.execute-api.us-east-2.amazonaws.com/prod/get-presigned-url', {
            key: file.name});

        const { url, fields } = response.data;

        console.log(response.data);

        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
            if (typeof value === 'string' || value instanceof Blob) {
                formData.append(key, value);
            } else {
                console.error(`Unexpected type for field: ${key}`);
            }
        });
        formData.append('file', file);

        formData.forEach((value, key) => {
            console.log(key, value);
        });

        const uploadResponse = await axios.post(url, formData);

        if (uploadResponse.status === 204) {
            return { success: true, message: 'File uploaded successfully' };
        } else {
            return { success: false, message: 'Upload failed' };
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error uploading file to S3: ', error.message);
            return { success: false, message: error.message };
        } else {
            console.error('Unexpected error uploading file to S3');
            return { success: false, message: 'Unexpected error' };
        }
    }
};

export default uploadFileToS3;