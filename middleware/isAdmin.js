const { requireRole } = require('./roleGuard.js')

module.exports = requireRole('Administrador')
