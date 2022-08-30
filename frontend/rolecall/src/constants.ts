import { NavBarChild } from 'src/types';

/**
 * The nav bar data structures to build out the
 * navigation panels that link to other views.
 */
export const constNavBarEntries: NavBarChild[] = [
  {
    name: 'Dashboard',
    routerLinkUrl: '/dashboard',
    icon: 'dashboard'
  },
  {
    name: 'Users',
    routerLinkUrl: 'user/',
    icon: 'person'
  },
  {
    name: 'Segments',
    routerLinkUrl: 'segment/',
    icon: 'extension'
  },
  {
    name: 'Casts',
    routerLinkUrl: 'cast/',
    icon: 'group'
  },
  {
    name: 'Performances',
    routerLinkUrl: 'performance/',
    icon: 'sports_kabaddi'
  },
  {
    name: 'Unavailabilities',
    routerLinkUrl: 'unavailability',
    icon: 'report_problem'
  }
];

/** Color variables. */
export const COLORS = {
  white: 'white',
  offWhite: '#f4f4f4',
  offoffWhite: '#d9d9d9',
  aaOrange: '#ffae00'
};

/** # casts for the standard ballet. */
export const CAST_COUNT = 3;
