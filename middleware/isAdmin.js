module.exports = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/menu/menu')
  }

  if (req.session.user.rol !== 'Administrador') {
    return res.status(403).send('Acceso denegado')
  }

  next()
}
