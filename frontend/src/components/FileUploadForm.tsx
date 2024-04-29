import React, {useState} from 'react';
import uploadFileToS3 from "@/services/uploadFileToS3";
import saveToDynamoDB from "@/services/saveToDynamoDB";

const FileUploadForm = () => {
    const [inputText, setInputText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(event.target.value);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setFile(files[0]);
        } else {
            setFile(null);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!file) {
            alert('Please select a file before submitting!');
            return;
        }

        const fileUploadStatus = await uploadFileToS3(file);
        if (fileUploadStatus.success) {
            await saveToDynamoDB(inputText, file.name);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Input text"
                    value={inputText}
                    onChange={handleInputChange}
                    className="input input-bordered w-full max-w-xs"
                />
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="input input-bordered w-full max-w-xs"
                />
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
};

export default FileUploadForm;
