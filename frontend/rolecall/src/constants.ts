import { AppTypes } from 'src/types';

/**
 * The nav bar data structures to build out the
 * navigation panels that link to other views
 */
export let constNavBarEntries: AppTypes.NavBarChild[] = [
  {
    name: 'Dashboard',
    routerLinkUrl: '/',
    icon: 'dashboard'
  },
  {
    name: 'Settings',
    routerLinkUrl: 'settings/',
    icon: 'settings'
  },
];