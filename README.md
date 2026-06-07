# MEXIMCO Corporate Platform

## Architecture Overview
The MEXIMCO platform is structured to support both a responsive, front-facing corporate website and a robust administrative backend. The architecture is split between a static/dynamic frontend and a dual-capable backend API, offering flexibility in deployment environments.

- **Frontend:** HTML5, CSS3, Vanilla JavaScript. The site includes multiple pages showcasing the company's vision, team, products, and impact.
- **Backend (PHP):** A lightweight PHP-based REST API located in `public_html/api/` providing endpoints for database interaction, authentication, and file uploads. Uses PDO for secure database access.
- **Backend (Node.js):** An alternative/complementary Node.js API located in `server/server.js` using Express, PostgreSQL (`pg`), and Multer for scalable backend operations.
- **Admin Panel:** A dedicated interface located in `public_html/admin/` for content management, built with Vanilla JS communicating with the backend APIs via JWT-based authentication.

## Technology Stack Summary
- **Client-Side:** HTML, CSS (Custom Animations), Vanilla JavaScript (DOM manipulation, Fetch API).
- **Server-Side (PHP Environment):** PHP 7.4+, MySQL/MariaDB, PDO.
- **Server-Side (Node Environment):** Node.js, Express.js, PostgreSQL, jsonwebtoken, bcryptjs.
- **Security:** Environment variable-based configuration, JWT Authentication, Prepared Statements (PDO & pg).

## Feature Summary
- **Dynamic Content Management:** Admin panel allows CRUD operations on products, team members, and blogs.
- **Secure Authentication:** JWT-based login system for administrators.
- **File Handling:** Secure file upload capabilities for images and documents.
- **Responsive Design:** A fully responsive frontend tailored for mobile and desktop viewing.

## Folder Structure Explanation
- `/public_html`: The public-facing web root. Contains all HTML, CSS, JS, and image assets.
  - `/api`: The PHP backend endpoints for database interaction.
  - `/admin`: The administrative frontend dashboard.
  - `/icons`, `/Team`: Asset directories.
- `/server`: The Node.js backend application containing the Express server and `package.json`.
- Various Markdown documentation outlining deployment, security, and project planning.

## Deployment Overview
Deployment involves pointing the web server document root to the `public_html` directory, configuring a MySQL/MariaDB database, and setting up environment variables via a secure `.env` file or server configuration. Detailed deployment steps can be found in `deployment_docs.md`.
