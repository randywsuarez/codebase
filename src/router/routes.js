const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // Existing route
      { path: '', name: 'dashboard', component: () => import('pages/Index.vue') }, // Added name

      // Resource Management Routes
      { path: 'locations', name: 'locations', component: () => import('pages/LocationsPage.vue') },
      { path: 'projects', name: 'projects', component: () => import('pages/ProjectsPage.vue') },

      // Setting sub-routes (Consider nesting under a /settings path?)
      { path: 'roles', name: 'roles', component: () => import('pages/RolesPage.vue') },
      { path: 'users', name: 'users', component: () => import('pages/UserPage.vue') }, // Renamed path to users
      { path: 'user-roles', name: 'user-roles', component: () => import('pages/UserRolesPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*', // Updated catch-all syntax for Vue Router 4+
    component: () => import('pages/Error404.vue')
  }
]

export default routes
