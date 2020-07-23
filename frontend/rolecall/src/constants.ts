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

/** Color variables */
declare namespace Colors {
  const white = 'white';
  const offWhite = '#f4f4f4';
  const offoffWhite = '#d9d9d9';
  const AAOrange = '#ffae00';
}