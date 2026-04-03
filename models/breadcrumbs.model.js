// Modulo de BreadCrumbs

exports.getBreadcrumbs = (page) => {
  // Diccioario de Diccionarios de breadcrumbs y sus valores a los cuales cualquier EJS puede acceder
  const dictionary = {
    Menu: [
      { name: 'Estado Royalty', url: '/cliente/royalty' },
      { name: 'Carrito', url: '/cliente/orden' },
      { name: 'Log In', url: '/cliente/login' },
      { name: 'AdminHub', url: '/admin/' },
      // Esta es la activa
      { name: 'Menu', url: '' }
    ],
    Royalty: [
      { name: 'Menu', url: '/menu/menu' },
      { name: 'Carrito', url: '/cliente/orden' },
      // Activa
      { name: 'Estado Royalty', url: '' }

    ],
    Orden: [
      { name: 'Menu', url: '/menu/menu' },
      { name: 'Estado Royalty', url: '/cliente/royalty' },
      { name: 'Log In', url: '/cliente/login' },
      // Activa
      { name: 'Carrito', url: '' }
    ],
    LogIn: [
      { name: 'Menu', url: '/menu/menu' },
      { name: 'Carrito', url: '/cliente/orden' },
      // Activa
      { name: 'Log In', url: '' }

    ],
    // Este breadcrumb es para el Dashboard en general
    Admin: [
      { name: 'Menu Cliente', url: '/menu/menu' },
      // Activa
      { name: 'Admin Hub', url: '' }
    ],
    // Este breadcrumb es prototipo para todas las seccion dentro del AdminDashboard (productos, Promos, etc)
    AdminSection: [
      {
        name: 'Regresar a adminHub', url: '/admin/'
      }
    ]

  }
  return dictionary[page] || []
}
