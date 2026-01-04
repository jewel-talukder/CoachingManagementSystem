module.exports = {
  apps: [{
    name: 'coaching-frontend',
    script: 'npm',
    args: 'start',
    cwd: './coaching-frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'http://93.127.140.63:4000/api'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};

