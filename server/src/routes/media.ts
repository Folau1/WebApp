import { Router } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { presignUrlSchema } from '../schemas/media';
import { AppError } from '../middleware/error';
import { verifyAdminToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const mediaRouter = Router();

// Initialize S3 client
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!
  },
  forcePathStyle: true // For MinIO compatibility
});

// Get presigned URL for upload
mediaRouter.post('/presign', verifyAdminToken, async (req, res, next) => {
  try {
    const data = presignUrlSchema.parse(req.body);
    
    // Validate content type
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    
    if (data.kind === 'IMAGE' && !allowedImageTypes.includes(data.contentType)) {
      throw new AppError(400, 'Invalid image type. Allowed: JPEG, PNG, WebP, GIF');
    }
    
    if (data.kind === 'VIDEO' && !allowedVideoTypes.includes(data.contentType)) {
      throw new AppError(400, 'Invalid video type. Allowed: MP4, WebM, MOV');
    }
    
    // Generate unique key
    const ext = data.filename.split('.').pop();
    const key = `${data.kind.toLowerCase()}s/${uuidv4()}.${ext}`;
    
    // Create presigned URL
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      ContentType: data.contentType
    });
    
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    const publicUrl = `${process.env.S3_PUBLIC_URL}/${key}`;
    
    res.json({
      uploadUrl,
      publicUrl,
      key
    });
  } catch (error) {
    next(error);
  }
});

