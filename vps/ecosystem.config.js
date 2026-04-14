module.exports = {
  apps: [
    {
      name: "el-coro-monitor",
      script: "./monitor-worker.js",
      autorestart: true,
      max_restarts: 10,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_size: "10M",
      retain: 5,
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "el-coro-support",
      script: "./support-worker.js",
      autorestart: true,
      max_restarts: 10,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_size: "10M",
      retain: 5,
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "el-coro-growth",
      script: "./growth-worker.js",
      autorestart: true,
      max_restarts: 10,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_size: "10M",
      retain: 5,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
