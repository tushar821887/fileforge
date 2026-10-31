module.exports = {
  apps: [
    {
      name: 'formatflow-backend',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        CORS_ORIGINS: 'https://fileforge.anythingforyou.in',
        FILE_RETENTION_MINUTES: 60,
        MAX_FILE_SIZE_MB: 50,
      },
    },
  ],
};
