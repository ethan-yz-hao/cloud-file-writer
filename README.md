# Cloud File Writer

![System Design](https://raw.githubusercontent.com/ethan-yz-hao/cloud-file-writer/main/images/system_design.svg)

Cloud File Writer is a cloud-based application that allows users to append text to a file, with all operations being performed on the cloud using AWS services. The project is written in TypeScript and utilizes the AWS SDK for interfacing with AWS services and the AWS CDK for creating the infrastructure.

Deployed at Amplify: [Cloud File Writer](https://main.d1eos5bt6pnhr6.amplifyapp.com/)

## Features

- **File Upload and Text Appending**: Users can upload a file, input text to append, and specify an output file name.
  - ![frontend](https://raw.githubusercontent.com/ethan-yz-hao/cloud-file-writer/main/images/frontend.png)

- **AWS Lambda Functions**:
  - Provides a pre-signed URL for secure file uploads directly to an S3 bucket.
    - The browser uploads the file to an S3 bucket using the pre-signed URL.
    - ![s3](https://raw.githubusercontent.com/ethan-yz-hao/cloud-file-writer/main/images/lambdapresignedurl.png)
    - ![s3](https://raw.githubusercontent.com/ethan-yz-hao/cloud-file-writer/main/images/s3.png)

  - Stores the metadata of the file in DynamoDB.
    - ![lambdadynamodb](https://raw.githubusercontent.com/ethan-yz-hao/cloud-file-writer/main/images/lambdadynamodb.png)
    - ![dynamodb](https://raw.githubusercontent.com/ethan-yz-hao/cloud-file-writer/main/images/dynamodb.png) 

  - Controls the EC2 instance to append text to the file, triggered by the metadata stored in DynamoDB.
    - The EC2 instance downloads and executes a bash script from S3 to append text.
    - ![lambdaec2](https://raw.githubusercontent.com/ethan-yz-hao/cloud-file-writer/main/images/lambdaec2.png)

- **Infrastructure Automation**: Uses CDK to create an S3 bucket, a DynamoDB table, three Lambda functions, and to store the bash script in S3.
  -  ![lambdabucketdeploy.png](https://raw.githubusercontent.com/ethan-yz-hao/cloud-file-writer/main/images/lambdabucketdeploy.png)

- **Frontend Deployment**: Frontend deployed as an Amplify app.

## Technologies

### Frontend
- **React, TailwindCSS, & Flowbite**: For building a dynamic, styled frontend.
- **Axios**: Used for making HTTP requests to backend services.
- **AWS Amplify**: For frontend deployment and hosting.

### Backend
- **AWS Lambda**: Manages pre-signed URL generation, metadata storage, and EC2 control.
- **AWS S3**: Stores files and executable bash scripts.
- **AWS DynamoDB**: Used for metadata storage of files.
- **AWS EC2**: Hosts and executes the file modification operations.
- **AWS CDK**: Automates the creation and management of cloud infrastructure.

## Setup

1. Clone the repository.
2. Install the dependencies.

   Install for the frontend:
   ```bash
   cd frontend
   npm install
   ```

   Install for the backend:
   ```bash
   cd backend
   npm install
   ```

   Install for the CDK:
   ```bash
   cd cdk
   npm install
   ```

3. Create IAM user with the following permissions:
   - AdministratorAccess	
   - AmazonDynamoDBFullAccess
   - AmazonEC2ContainerRegistryFullAccess	
   - AmazonS3FullAccess	
   - AmazonSSMFullAccess	
   - AWSCloudFormationFullAccess	
   - AWSLambda_FullAccess
   - IAMFullAccess

4. Configure the AWS CLI with the IAM user credentials.
   ```bash
   aws configure
   ```

5. Deploy the CDK stack.
   ```bash
   cdk deploy
   ```

6. Create a `.env` file in the `frontend` directory and add the output API URL from the CDK stack.:
   ```bash
   REACT_APP_API_URL=<API_URL>
   ```
   
7. Deploy the frontend.
   
   Local development:
   ```bash
   cd frontend
   npm run dev
   ```
   Production build: deploy as Amplify app.