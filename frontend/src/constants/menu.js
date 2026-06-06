export const MENU_ITEMS = {
  admin: [
    { key: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { key: 'stores',    label: 'Stores',    path: '/admin/stores',    icon: 'store'     },
    { key: 'users',     label: 'Users',     path: '/admin/users',     icon: 'users'     },
    { key: 'ratings',   label: 'Ratings',   path: '/admin/ratings',   icon: 'star'      },
    { key: 'settings',  label: 'Settings',  path: '/admin/settings',  icon: 'settings'  },
  ],
  storeOwner: [
    { key: 'dashboard', label: 'Dashboard', path: '/store/dashboard', icon: 'dashboard' },
    { key: 'stores',    label: 'My Stores', path: '/store/stores',    icon: 'store'     },
    { key: 'ratings',   label: 'Ratings',   path: '/store/ratings',   icon: 'star'      },
    { key: 'settings',  label: 'Settings',  path: '/store/settings',  icon: 'settings'  },
  ],
  user: [
    { key: 'dashboard', label: 'Dashboard', path: '/user/dashboard',  icon: 'dashboard' },
    { key: 'stores',    label: 'Stores',    path: '/user/stores',     icon: 'store'     },
    { key: 'ratings',   label: 'My Ratings',path: '/user/ratings',    icon: 'star'      },
    { key: 'settings',  label: 'Profile Settings',  path: '/user/settings',   icon: 'settings'  },
  ],
};
