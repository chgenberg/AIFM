/**
 * Centralized Configuration Management
 * Handles all environment-specific settings
 */

interface DatabaseConfig {
  url: string;
  poolSize: number;
  timeout: number;
  logQueries: boolean;
}

interface RedisConfig {
  url: string;
  maxRetries: number;
  timeout: number;
  keyPrefix: string;
}

interface CorsConfig {
  origin: string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
}

interface AuthConfig {
  clerkSecretKey: string;
  clerkPublishableKey: string;
  sessionTimeout: number;
  jwtExpiry: number;
}

interface ApiConfig {
  port: number;
  baseUrl: string;
  requestTimeout: number;
  maxBodySize: string;
  maxJsonSize: string;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  format: 'json' | 'text';
  dir: string;
  maxSize: string;
  maxFiles: string;
}

interface FileUploadConfig {
  maxSize: number;
  allowedMimes: string[];
  uploadDir: string;
}

interface SecurityConfig {
  enableCsrf: boolean;
  enableCors: boolean;
  enableHsts: boolean;
  hstsMaxAge: number;
  enableXssProtection: boolean;
  enableFrameGuard: boolean;
  enableNoSniff: boolean;
}

interface Config {
  nodeEnv: 'development' | 'staging' | 'production' | 'test';
  database: DatabaseConfig;
  redis: RedisConfig;
  cors: CorsConfig;
  auth: AuthConfig;
  api: ApiConfig;
  rateLimit: RateLimitConfig;
  logging: LoggingConfig;
  fileUpload: FileUploadConfig;
  security: SecurityConfig;
  sentry: {
    dsn: string;
    enabled: boolean;
    tracesSampleRate: number;
  };
}

// Validate required environment variables
function validateEnv(): void {
  const required = [
    'DATABASE_URL',
    'REDIS_URL',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Build configuration based on environment
function getConfig(): Config {
  validateEnv();

  const nodeEnv = (process.env.NODE_ENV || 'development') as Config['nodeEnv'];
  const isDev = nodeEnv === 'development';
  const isProd = nodeEnv === 'production';
  const isTest = nodeEnv === 'test';

  return {
    nodeEnv,

    database: {
      url: process.env.DATABASE_URL!,
      poolSize: parseInt(process.env.DB_POOL_SIZE || (isProd ? '20' : '5')),
      timeout: parseInt(process.env.DB_TIMEOUT || '5000'),
      logQueries: isDev && process.env.LOG_QUERIES === 'true',
    },

    redis: {
      url: process.env.REDIS_URL!,
      maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
      timeout: parseInt(process.env.REDIS_TIMEOUT || '5000'),
      keyPrefix: process.env.REDIS_KEY_PREFIX || `aifm:${nodeEnv}:`,
    },

    cors: {
      origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit'],
    },

    auth: {
      clerkSecretKey: process.env.CLERK_SECRET_KEY!,
      clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || String(24 * 60 * 60 * 1000)),
      jwtExpiry: parseInt(process.env.JWT_EXPIRY || String(7 * 24 * 60 * 60 * 1000)), // 7 days
    },

    api: {
      port: parseInt(process.env.PORT || '3000'),
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
      maxBodySize: process.env.MAX_BODY_SIZE || '10mb',
      maxJsonSize: process.env.MAX_JSON_SIZE || '10mb',
    },

    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || String(15 * 60 * 1000)), // 15 min
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (isProd ? '100' : '1000')),
      skipSuccessfulRequests: false,
      skipFailedRequests: true,
    },

    logging: {
      level: (process.env.LOG_LEVEL || (isProd ? 'info' : 'debug')) as LoggingConfig['level'],
      format: (process.env.LOG_FORMAT || (isProd ? 'json' : 'text')) as LoggingConfig['format'],
      dir: process.env.LOG_DIR || './logs',
      maxSize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
    },

    fileUpload: {
      maxSize: parseInt(process.env.FILE_UPLOAD_MAX_SIZE || String(10 * 1024 * 1024)), // 10 MB
      allowedMimes: (process.env.FILE_UPLOAD_ALLOWED_MIMES || 'application/json,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').split(','),
      uploadDir: process.env.FILE_UPLOAD_DIR || './uploads',
    },

    security: {
      enableCsrf: process.env.ENABLE_CSRF !== 'false',
      enableCors: process.env.ENABLE_CORS !== 'false',
      enableHsts: isProd && process.env.ENABLE_HSTS !== 'false',
      hstsMaxAge: parseInt(process.env.HSTS_MAX_AGE || String(31 * 24 * 60 * 60)), // 31 days
      enableXssProtection: process.env.ENABLE_XSS !== 'false',
      enableFrameGuard: process.env.ENABLE_FRAME_GUARD !== 'false',
      enableNoSniff: process.env.ENABLE_NO_SNIFF !== 'false',
    },

    sentry: {
      dsn: process.env.SENTRY_DSN || '',
      enabled: !!process.env.SENTRY_DSN && isProd,
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    },
  };
}

// Export singleton config instance
export const config = getConfig();

// Export type for usage
export type { Config };
