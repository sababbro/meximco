# MEXIMCO Deployment Documentation

## 1. Prerequisites
- **Web Server:** Apache or Nginx with PHP 7.4+ support.
- **Database:** MySQL/MariaDB for PHP API, PostgreSQL for Node.js API (if utilizing the Node.js server).
- **Node.js:** Node.js v18+ (if utilizing the Node.js server).
- **Domain:** A registered domain with DNS pointing to the server's public IP.

## 2. Environment Configuration
Create a `.env` file based on `.env.example`. This file should reside securely and must **not** be tracked by Git.

```env
# Database Configuration
DB_HOST=localhost
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASS=your_secure_password

# Security
JWT_SECRET=your_secure_jwt_secret

# Admin Credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password
```

## 3. Web Server Configuration
The document root must point to the `public_html` directory to ensure that backend files outside this directory (like the `server` folder or other system files) are not publicly accessible. Ensure `mod_rewrite` is enabled on Apache to process `.htaccess` directives for routing if required.

## 4. Node.js API (Optional/Alternative)
If running the Node.js API instead of or alongside the PHP API:
1. Navigate to the `server/` directory.
2. Run `npm install` to install dependencies.
3. Configure the PostgreSQL database using `DATABASE_URL` in the environment.
4. Run `npm start` (preferably using a process manager like PM2: `pm2 start server.js --name "meximco-api"`).
5. Set up a reverse proxy in your web server to route `/api` traffic to the Node.js server port (default 3001).

## 5. Security Post-Deployment Checks
- Verify `.env` is inaccessible from the browser.
- Ensure upload directories (`public_html/uploads` or `server/uploads`) do not have execute permissions.
- Validate that SSL/TLS is properly configured.
