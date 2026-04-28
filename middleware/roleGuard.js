const INTERNAL_ROLES = new Set(['Administrador', 'Colaborador'])

const getSessionRole = (req) => {
  return req.session?.user?.rol || req.session?.rol || null
}

const hasInternalSession = (req) => {
  const role = getSessionRole(req)
  return Boolean(req.session?.user && INTERNAL_ROLES.has(role))
}

const redirectToMenu = (res) => {
  return res.redirect('/menu/menu')
}

const requireInternalAuth = (req, res, next) => {
  if (!hasInternalSession(req)) {
    return redirectToMenu(res)
  }

  next()
}

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!hasInternalSession(req)) {
      return redirectToMenu(res)
    }

    const currentRole = getSessionRole(req)
    if (!allowedRoles.includes(currentRole)) {
      return res.status(403).send('Acceso denegado')
    }

    next()
  }
}

module.exports = {
  getSessionRole,
  hasInternalSession,
  requireInternalAuth,
  requireRole
}
