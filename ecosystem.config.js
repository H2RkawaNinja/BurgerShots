module.exports = {
  apps: [
    {
      name: 'burgershot-api',
      script: 'index.js',
      cwd: './server',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },
  ],
};
