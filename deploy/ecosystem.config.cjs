module.exports = {
  apps: [
    {
      name: "allctp-backend",
      cwd: "/var/www/allctp/apps/backend",
      script: "dist/server.js",
      instances: 1,
      exec_mode: "fork",
      env_file: "/var/www/allctp/.env",
      autorestart: true,
      max_memory_restart: "400M",
      out_file: "/var/log/allctp/backend.out.log",
      error_file: "/var/log/allctp/backend.err.log"
    }
  ]
};
