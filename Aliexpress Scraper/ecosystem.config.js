// ecosystem.config.js - Configuração PM2 para ESM
export default {
  apps: [{
    name: 'aliexpress-scraper',
    script: 'index.js',
    interpreter: 'node',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    env_development: {
      NODE_ENV: 'development'
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
};
