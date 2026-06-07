# MEXIMCO Secret Inventory

The following secrets were identified during the repository discovery phase:

| Secret Type | Variable Name | Location | Usage |
| :--- | :--- | :--- | :--- |
| Database Host | `DB_HOST` | `public_html/api/db.php` | PDO MySQL Connection Host |
| Database Name | `DB_NAME` | `public_html/api/db.php` | PDO MySQL Connection Database Name |
| Database User | `DB_USER` | `public_html/api/db.php` | PDO MySQL Connection Username |
| Database Password | `DB_PASS` | `public_html/api/db.php` | PDO MySQL Connection Password |
| JWT Secret | `JWT_SECRET` | `public_html/api/db.php` | Signing and verifying JSON Web Tokens |
| Admin Email | `ADMIN_EMAIL` | `public_html/api/db.php` | Administrator authentication |
| Admin Password | `ADMIN_PASSWORD` | `public_html/api/db.php` | Administrator authentication |
| Database URL | `process.env.DATABASE_URL` | `server/server.js` | PostgreSQL Connection string |
| Node JWT Secret| `process.env.JWT_SECRET` | `server/server.js` | Signing and verifying JSON Web Tokens in Node.js |
| Node Admin Email| `process.env.ADMIN_EMAIL` | `server/server.js` | Administrator authentication in Node.js |
| Node Admin Pass | `process.env.ADMIN_PASSWORD` | `server/server.js` | Administrator authentication in Node.js |

*Note: The Node.js application (`server/server.js`) currently reads these from `process.env` correctly, but no `.env.example` exists. The PHP API (`public_html/api/db.php`) hardcodes its values.*
