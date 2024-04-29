import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'MyUniqueBucketName', {
      removalPolicy: cdk.RemovalPolicy.RETAIN,  // DESTROY for dev
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

    const table = new dynamodb.Table(this, 'MetadataTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const backendLambda = new lambda.Function(this, 'BackendLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/functions')),
      environment: {
        TABLE_NAME: table.tableName,
        BUCKET_NAME: bucket.bucketName
      }
    });

    backendLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['s3:*', 'dynamodb:*'],
      resources: [bucket.bucketArn, table.tableArn],
    }));

    const api = new apigateway.LambdaRestApi(this, 'LambdaApi', {
      handler: backendLambda,
      proxy: false
    });

    const items = api.root.addResource('items');
    items.addMethod('POST');
  }
}
