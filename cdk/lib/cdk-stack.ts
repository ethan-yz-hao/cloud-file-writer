import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class CdkStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const bucket = new s3.Bucket(this, 'CloudFileWriter', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,  // DESTROY for dev, RETAIN for prod
            publicReadAccess: false,
            cors: [
                {
                    allowedOrigins: ['*'],
                    allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST, s3.HttpMethods.DELETE],
                    allowedHeaders: ['*'],
                    maxAge: 3000,
                },
            ],
        });

        // const userArn = 'arn:aws:iam::164452774963:user/cloud-file-writer';
        // bucket.addToResourcePolicy(new iam.PolicyStatement({
        //     actions: ['s3:GetObject', 's3:PutObject'],
        //     resources: [bucket.bucketArn + '/*'],
        //     principals: [new iam.ArnPrincipal(userArn)],
        // }));

        const table = new dynamodb.Table(this, 'MetadataTable', {
            partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        const getPresignedUrlLambda = new lambda.Function(this, 'GetPresignedUrlLambda', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/functions/getPresignedUrl')),
            environment: {
                BUCKET_NAME: bucket.bucketName,
            },

        });

        const saveMetadataLambda = new lambda.Function(this, 'SaveMetadataLambda', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/functions/saveMetadata')),
            environment: {
                TABLE_NAME: table.tableName
            },
            // role: new iam.Role(this, 'SaveMetadataLambdaRole', {
            //     assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            // }),
        });


        getPresignedUrlLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject', 's3:PutObject'],
            resources: [bucket.bucketArn + "/*"],
        }));

        saveMetadataLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ['dynamodb:PutItem'],
            resources: [table.tableArn],
        }));

        const api = new apigateway.RestApi(this, 'ApiGateway', {
            restApiName: 'CloudFileWriterServiceAPI',
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: apigateway.Cors.DEFAULT_HEADERS
            }
        });

        const integrationOptions = {
            integrationResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Origin': "'*'",
                        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
                        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                    },
                    responseTemplates: {
                        'application/json': ""
                    }
                }
            ],
            requestTemplates: {"application/json": '{ "statusCode": 200 }'}
        };

        const getPresignedUrlLambdaIntegration = new apigateway.LambdaIntegration(getPresignedUrlLambda, integrationOptions);
        const saveMetadataLambdaIntegration = new apigateway.LambdaIntegration(saveMetadataLambda, integrationOptions);

        const getPresignedUrlResource = api.root.addResource('get-presigned-url');
        getPresignedUrlResource.addMethod('POST', getPresignedUrlLambdaIntegration,
            {
                methodResponses: [{
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Origin': true,
                        'method.response.header.Access-Control-Allow-Methods': true,
                        'method.response.header.Access-Control-Allow-Headers': true,
                    }
                }]
            });

        const saveMetadataResource = api.root.addResource('save-metadata');
        saveMetadataResource.addMethod('POST', saveMetadataLambdaIntegration,
            {
                methodResponses: [{
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Origin': true,
                        'method.response.header.Access-Control-Allow-Methods': true,
                        'method.response.header.Access-Control-Allow-Headers': true,
                    }
                }]
            });
    }
}
