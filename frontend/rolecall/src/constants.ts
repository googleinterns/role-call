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
    name: 'Castsv1',
    routerLinkUrl: 'cast/',
    icon: 'group'
  },
  {
    name: 'Casts',
    routerLinkUrl: 'castv2/',
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