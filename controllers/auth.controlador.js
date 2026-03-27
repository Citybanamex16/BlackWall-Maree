req.session.user = {
  id: colaborador.IDColaborador,
  rol: 'admin',
  nombre: colaborador.NombreColaborador
}
req.session.name = colaborador.NombreColaborador