// backend/src/middleware/rbac.middleware.js

/**
 * Generates a middleware that restricts access to the given roles.
 * Must be used AFTER the `authenticate` middleware, which sets req.user.
 *
 * @param {...string} allowedRoles  – e.g. authorize('ADMIN', 'COORDINATOR')
 *
 * Usage:
 *   router.get('/admin-only', authenticate, authorize('ADMIN'), controller)
 *   router.get('/staff',      authenticate, authorize('ADMIN', 'COORDINATOR'), controller)
 */
function authorize(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      // Middleware ordering mistake — authenticate was not called first
      return res.status(401).json({
        message: 'Pristup odbijen. Korisnik nije autentificiran.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Nemate dozvolu za pristup ovom resursu.',
      });
    }

    next();
  };
}

module.exports = { authorize };