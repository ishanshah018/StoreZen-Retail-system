//=============================================================================
// MANAGER AUTHENTICATION ROUTES
//=============================================================================
// Defines API endpoints for manager authentication in StoreZen retail system
// Features: Login validation middleware, secure authentication endpoints
//=============================================================================

const { managerLogin } = require("../Controllers/ManagerAuthController");
const { loginvalidation } = require("../Middlewares/AuthValidation");
const router = require("express").Router();

/**
 * POST /manager/auth/login
 * Authenticates a manager and returns JWT token
 * Middleware: loginvalidation - validates email and password format
 * Controller: managerLogin - handles authentication logic
 */
router.post('/login', loginvalidation, managerLogin);

module.exports = router;
