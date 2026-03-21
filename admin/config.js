// ================================================
// MEXIMCO ADMIN — API CONFIGURATION
// ================================================
const CONFIG = {
    API_URL: window.location.origin,
    endpoints: {
        login:    '/api/auth.php?action=login',
        verify:   '/api/auth.php?action=verify',
        stats:    '/api/stats.php',
        messages: '/api/messages.php',
        blogs:    '/api/blogs.php',
        team:     '/api/team.php',
        products: '/api/products.php'
    }
};
