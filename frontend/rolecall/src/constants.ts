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
  {
    name: 'Users',
    routerLinkUrl: 'user/',
    icon: 'person'
  },
  {
    name: 'Pieces',
    routerLinkUrl: 'piece/',
    icon: 'extension'
  },
  {
    name: 'Casts',
    routerLinkUrl: 'cast/',
    icon: 'group'
  },
];

/** Color variables */
export let Colors = {
  white: 'white',
  offWhite: '#f4f4f4',
  offoffWhite: '#d9d9d9',
  AAOrange: '#ffae00'
}