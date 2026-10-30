import path from 'path';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigins: string[];
  storagePath: string;
  maxFileSizeMb: number;
  maxBatchFiles: number;
  fileRetentionMinutes: number;
  throttleTtl: number;
  throttleLimit: number;
  sofficePath?: string;
}

export default (): AppConfig => {
  const rootDir = process.cwd();
  return {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:4200,http://localhost:3000')
      .split(',')
      .map((o) => o.trim()),
    storagePath: process.env.STORAGE_PATH
      ? path.resolve(process.env.STORAGE_PATH)
      : path.join(rootDir, 'storage', 'temp'),
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? '50', 10),
    maxBatchFiles: parseInt(process.env.MAX_BATCH_FILES ?? '15', 10),
    fileRetentionMinutes: parseInt(process.env.FILE_RETENTION_MINUTES ?? '60', 10),
    throttleTtl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
    throttleLimit: parseInt(process.env.THROTTLE_LIMIT ?? '60', 10),
    sofficePath: process.env.SOFFICE_PATH || undefined,
  };
};
