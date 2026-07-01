/* Authentication middleware

  > requireAuth: ensures a user is logged in (session with user present).
  > requireAdmin: ensures a logged-in user has an admin role.
*/

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }
// reminder to add admin check logic here and finish the functionfor promise like next....
if (req.session.user.role !== "admin") {
    return res.status(403).json({
      error: "Admin access required.",
    });
  }

  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
};
