import React, {useState} from 'react';
import uploadFileToS3 from "@/services/uploadFileToS3";
import saveToDynamoDB from "@/services/saveToDynamoDB";

const FileUploadForm = () => {
    const [inputText, setInputText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [outputFileName, setOutputFileName] = useState('');

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
        if (!inputText) {
            alert('Please enter the text before submitting!');
            return;
        }
        if (!outputFileName) {
            alert('Please enter the output file name before submitting!');
            return;
        }

        const fileUploadStatus = await uploadFileToS3(file);
        if (fileUploadStatus.success) {
            await saveToDynamoDB(inputText, outputFileName, fileUploadStatus.filePath!);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="block">
                    <span className="block text-sm font-medium text-gray-700">Input text:</span>
                    <input
                        type="text"
                        placeholder="Enter text"
                        value={inputText}
                        onChange={(event) => setInputText(event.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </label>
                <label className="block">
                    <span className="block text-sm font-medium text-gray-700">Select file:</span>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </label>
                <label className="block">
                    <span className="block text-sm font-medium text-gray-700">Output file name:</span>
                    <input
                        type="text"
                        placeholder="Output file name"
                        value={outputFileName}
                        onChange={(event) => setOutputFileName(event.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </label>
                <div className="w-full flex justify-center">
                    <div className="w-12">
                        <button type="submit"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                            Submit
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default FileUploadForm;
