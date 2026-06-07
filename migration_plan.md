# MEXIMCO Secret Migration Plan

## Objective
Surgically remove hardcoded secrets from the codebase without breaking the existing production environment.

## Target File
`public_html/api/db.php`

## Strategy
1. **Identify the hardcoded definitions:**
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'YOUR_CPANEL_USER_meximco');
   define('DB_USER', 'YOUR_CPANEL_USER_admin');
   define('DB_PASS', 'YOUR_DB_PASSWORD');
   define('JWT_SECRET', 'meximco-admin-secret-2025-change-this');
   define('ADMIN_EMAIL', 'admin@meximcoltd.com');
   define('ADMIN_PASSWORD', 'meximco2025');
   ```
2. **Implement Fallback Logic:**
   Replace each static string with a `getenv()` call that falls back to the original static string.
   ```php
   define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
   define('DB_NAME', getenv('DB_NAME') ?: 'YOUR_CPANEL_USER_meximco');
   define('DB_USER', getenv('DB_USER') ?: 'YOUR_CPANEL_USER_admin');
   define('DB_PASS', getenv('DB_PASS') ?: 'YOUR_DB_PASSWORD');
   define('JWT_SECRET', getenv('JWT_SECRET') ?: 'meximco-admin-secret-2025-change-this');
   define('ADMIN_EMAIL', getenv('ADMIN_EMAIL') ?: 'admin@meximcoltd.com');
   define('ADMIN_PASSWORD', getenv('ADMIN_PASSWORD') ?: 'meximco2025');
   ```

## Rollback Plan
Since the migration utilizes the exact original strings as fallbacks, a failure to read the environment variables will result in the application continuing to function exactly as it does currently. If syntactical issues occur, we will restore `public_html/api/db.php` via git checkout.
