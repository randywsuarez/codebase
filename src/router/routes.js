const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // Existing route
      { path: '', component: () => import('pages/Index.vue') },
      
      // Setting sub-routes
      { path: 'roles', component: () => import('pages/RolesPage.vue') },
      { path: 'user', component: () => import('pages/UserPage.vue') },
      { path: 'user-roles', component: () => import('pages/UserRolesPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:', // Catch-all for 404, adjusted path
    component: () => import('pages/Error404.vue')
  }
]

export default routes
