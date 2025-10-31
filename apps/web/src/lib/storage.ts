/**
 * Storage Abstraction Layer
 * Supports both local file storage and S3-compatible storage
 * 
 * Usage:
 *   const storage = getStorage();
 *   const url = await storage.upload('documents/file.pdf', fileBuffer);
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface StorageAdapter {
  upload(key: string, file: Buffer, metadata?: StorageMetadata): Promise<StorageResult>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getFile(key: string): Promise<Buffer>;
}

export interface StorageMetadata {
  contentType?: string;
  fileName?: string;
  fileSize?: number;
  metadata?: Record<string, string>;
}

export interface StorageResult {
  url: string;
  key: string;
  size: number;
  contentType?: string;
  etag?: string;
}

/**
 * Local file storage adapter
 * Stores files in ./uploads directory
 */
export class LocalStorageAdapter implements StorageAdapter {
  private basePath: string;
  private baseUrl: string;

  constructor(basePath = './uploads', baseUrl = '/api/files') {
    this.basePath = basePath;
    this.baseUrl = baseUrl;
  }

  async upload(key: string, file: Buffer, metadata?: StorageMetadata): Promise<StorageResult> {
    const fullPath = path.join(this.basePath, key);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, file);

    // Calculate file hash for etag
    const hash = crypto.createHash('sha256').update(file).digest('hex');

    return {
      url: `${this.baseUrl}/${key}`,
      key,
      size: file.length,
      contentType: metadata?.contentType,
      etag: hash,
    };
  }

  async getUrl(key: string): Promise<string> {
    const exists = await this.exists(key);
    if (!exists) {
      throw new Error(`File not found: ${key}`);
    }
    return `${this.baseUrl}/${key}`;
  }

  async delete(key: string): Promise<void> {
    const fullPath = path.join(this.basePath, key);
    try {
      await fs.unlink(fullPath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    const fullPath = path.join(this.basePath, key);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async getFile(key: string): Promise<Buffer> {
    const fullPath = path.join(this.basePath, key);
    return await fs.readFile(fullPath);
  }
}

/**
 * S3 storage adapter (for future use)
 * Requires AWS SDK
 */
export class S3StorageAdapter implements StorageAdapter {
  private bucket: string;
  private region: string;

  constructor(bucket: string, region = 'eu-north-1') {
    this.bucket = bucket;
    this.region = region;
  }

  async upload(key: string, file: Buffer, metadata?: StorageMetadata): Promise<StorageResult> {
    // TODO: Implement S3 upload when needed
    // const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    // const s3 = new S3Client({ region: this.region });
    // ...
    throw new Error('S3 adapter not yet implemented');
  }

  async getUrl(key: string): Promise<string> {
    // Return S3 presigned URL or public URL
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async delete(key: string): Promise<void> {
    // TODO: Implement S3 delete
    throw new Error('S3 adapter not yet implemented');
  }

  async exists(key: string): Promise<boolean> {
    // TODO: Implement S3 exists check
    throw new Error('S3 adapter not yet implemented');
  }

  async getFile(key: string): Promise<Buffer> {
    // TODO: Implement S3 get
    throw new Error('S3 adapter not yet implemented');
  }
}

/**
 * Get storage adapter based on environment
 */
export function getStorage(): StorageAdapter {
  const storageType = process.env.STORAGE_TYPE || 'local';
  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION || 'eu-north-1';

  if (storageType === 's3' && bucket) {
    return new S3StorageAdapter(bucket, region);
  }

  const basePath = process.env.UPLOAD_PATH || './uploads';
  const baseUrl = process.env.UPLOAD_BASE_URL || '/api/files';
  return new LocalStorageAdapter(basePath, baseUrl);
}

