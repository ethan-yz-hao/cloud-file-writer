import axios from 'axios';

const uploadFileToS3 = async (file: File): Promise<{ success: boolean, message: string }> => {
    try {
        const response = await axios.post('/api/get-presigned-url', {
            fileName: file.name,
            fileType: file.type,
        });

        const { url, fields } = response.data;

        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
            if (typeof value === 'string' || value instanceof Blob) {
                formData.append(key, value);
            } else {
                console.error(`Unexpected type for field: ${key}`);
            }
        });
        formData.append('file', file);

        const uploadResponse = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (uploadResponse.status === 204) {
            return { success: true, message: 'File uploaded successfully' };
        } else {
            return { success: false, message: 'Upload failed' };
        }
    } catch (error) {
        return { success: false, message: `Upload error: ${error}` };
    }
};

export default uploadFileToS3;