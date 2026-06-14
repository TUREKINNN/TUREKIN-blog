module.exports = {
  apps: [
    {
      name: 'turekin-blog',
      script: './dist/src/index.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '300M',
      node_args: '--max-old-space-size=256',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/www/wwwroot/www.turekin.me/backend/pm2-error.log',
      out_file: '/www/wwwroot/www.turekin.me/backend/pm2-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
