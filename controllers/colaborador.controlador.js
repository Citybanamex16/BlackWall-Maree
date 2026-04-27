exports.getHub = (req, res) => {
  const breadcrumbs = [
    { name: 'Menu Cliente', url: '/menu/menu' },
    { name: 'Colaborador Hub', url: '' }
  ]

  const dashboardCards = [
    { title: 'Active Orders', url: '/admin/ordenes', icon: '📋', colorClass: 'bg-red' },
    { title: 'Products', url: '/menu/productos', icon: '🛍️', colorClass: 'bg-green' },
    { title: 'Ingredients', url: '/admin/ingredientes', icon: '📦', colorClass: 'bg-blue' },
    { title: 'Escanear Royalty', url: '#scanner', icon: '📷', colorClass: 'bg-yellow', isScanner: true }
  ]

  res.render('colaborador/index', {
    pageTitle: 'Colaborador Hub - Maree',
    breadcrumbs,
    dashboardCards
  })
}
