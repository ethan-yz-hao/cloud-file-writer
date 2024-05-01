#!/bin/bash

DATA=$(aws dynamodb get-item --table-name $TABLE_NAME --key '{"id": {"S": "'$ITEM_ID'"}}')

FILE_PATH=$(echo $DATA | jq -r '.Item.filePath.S')
INPUT_TEXT=$(echo $DATA | jq -r '.Item.inputText.S')
OUTPUT_FILE_NAME=$(echo $DATA | jq -r '.Item.OutputFileName.S')

aws s3 cp s3://$FILE_PATH /tmp/input-file

echo " : $INPUT_TEXT" >> /tmp/input-file

BUCKET_NAME=$(echo $FILE_PATH | cut -d'/' -f1)
aws s3 cp /tmp/input-file s3://$BUCKET_NAME/$OUTPUT_FILE_NAME
