import axios from 'axios';

const saveToDynamoDB = async (inputText: string, OutputFileName: string, filePath: string): Promise<boolean> => {
    try {
        const apiUrl = import.meta.env.VITE_API_URL + 'save-metadata';
        const response = await axios.post(apiUrl, {
            inputText,
            OutputFileName,
            filePath
        });

        return response.data.success;
    } catch (error) {
        console.error('Error saving metadata to DynamoDB', error);
        return false;
    }
};

export default saveToDynamoDB;
