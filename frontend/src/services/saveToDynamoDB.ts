import axios from 'axios';

const saveToDynamoDB = async (inputText: string, fileName: string): Promise<boolean> => {
    try {
        const response = await axios.post('https://hsds1jildd.execute-api.us-east-2.amazonaws.com/prod/save-metadata', {
            inputText,
            fileName,
            filePath: `s3://my-bucket-name/${fileName}`,
        });

        return response.data.success;
    } catch (error) {
        console.error('Error saving metadata to DynamoDB', error);
        return false;
    }
};

export default saveToDynamoDB;
