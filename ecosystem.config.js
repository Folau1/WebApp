module.exports = {
  apps: [
    {
      name: 'webapp-server',
      script: 'server/src/index.ts',
      cwd: '/root/WebApp',
      interpreter: 'npx',
      interpreter_args: 'tsx',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
