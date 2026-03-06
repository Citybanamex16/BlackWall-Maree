// Modulo de BreadCrumbs

exports.getBreadcrumbs = (page) => {
  // Diccioario de Diccionarios de breadcrumbs y sus valores a los cuales cualquier EJS puede acceder
  const dictionary = {
    Menu: [
      { name: 'Estado Royalty', url: '/cliente/royalty' },
      { name: 'Carrito', url: '/cliente/orden' },
      { name: 'Log In', url: '/cliente/login' },
      // Esta es la activa
      { name: 'Menu', url: '' }
    ],
    Royalty: [
      { name: 'Menu', url: '/cliente/' },
      { name: 'Carrito', url: '/cliente/orden' },
      // Activa
      { name: 'Estado Royalty', url: '' }

    ],
    Orden: [
      { name: 'Menu', url: '/cliente/' },
      { name: 'Estado Royalty', url: '/cliente/royalty' },
      { name: 'Log In', url: '/cliente/login' },
      // Activa
      { name: 'Carrito', url: '' }
    ],
    LogIn: [
      { name: 'Menu', url: '/cliente/' },
      { name: 'Carrito', url: '/cliente/orden' },
      // Activa
      { name: 'Log In', url: '' }

    ]

  }
  return dictionary[page] || []
}
