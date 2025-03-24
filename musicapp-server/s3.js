import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.join(process.cwd(), '.env');
console.log('S3: Loading .env file from:', envPath);
dotenv.config({ path: envPath });

// Validate required environment variables
const requiredEnvVars = ['AWS_BUCKET_NAME', 'AWS_BUCKET_REGION', 'AWS_ACCESS_KEY', 'AWS_SECRET_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Environment validation failed. Missing variables:', missingEnvVars);
  console.log('Current environment variables:');
  console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME);
  console.log('AWS_BUCKET_REGION:', process.env.AWS_BUCKET_REGION);
  console.log('AWS_ACCESS_KEY:', process.env.AWS_ACCESS_KEY ? '[HIDDEN]' : 'undefined');
  console.log('AWS_SECRET_KEY:', process.env.AWS_SECRET_KEY ? '[HIDDEN]' : 'undefined');
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Create S3 client
const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
});

// Upload file to S3
export const uploadFile = async (folder, file) => {
  try {
    const fileStream = fs.createReadStream(file.path);
    
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${folder}/${file.filename}`,
      Body: fileStream,
      ContentType: file.mimetype,
      CacheControl: 'max-age=31536000'
    };

    console.log('Uploading to S3 with params:', {
      Bucket: uploadParams.Bucket,
      Key: uploadParams.Key,
      Region: process.env.AWS_BUCKET_REGION
    });

    const command = new PutObjectCommand(uploadParams);
    const result = await s3Client.send(command);
    
    return {
      ...result,
      Key: uploadParams.Key
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Get file from S3
export const getFileStream = async (fileKey) => {
  try {
    const downloadParams = {
      Key: fileKey,
      Bucket: process.env.AWS_BUCKET_NAME
    };

    const command = new GetObjectCommand(downloadParams);
    const result = await s3Client.send(command);
    
    return result.Body;
  } catch (error) {
    console.error('Error getting file stream:', error);
    throw error;
  }
};