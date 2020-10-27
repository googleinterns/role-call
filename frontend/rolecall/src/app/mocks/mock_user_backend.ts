import {HttpResponse} from '@angular/common/http';
import * as APITypes from 'src/api_types';
import {isNullOrUndefined} from 'util';

import {AllUsersResponse, OneUserResponse, User} from '../api/user_api.service';

/**
 * Mocks the user backend responses
 */
export class MockUserBackend {

  /** Mock user database */
  mockUserDB: User[] = [
    {
      'uuid': '1',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': 'System',
      'middle_name': '',
      'last_name': 'Admin',
      'suffix': '',
      'picture_file': 'System_Admin',
      'date_joined': null,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'admin@rolecall.com',
        'notification_email': 'admin@rolecall.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '183',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Bozeman',
      'suffix': '',
      'picture_file': '_Bozeman',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'bozeman@email.com',
        'notification_email': 'bozeman@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '184',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Monteiro',
      'suffix': '',
      'picture_file': '_Monteiro',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'monteiro@email.com',
        'notification_email': 'monteiro@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '185',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Lebrun',
      'suffix': '',
      'picture_file': '_Lebrun',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'lebrun@email.com',
        'notification_email': 'lebrun@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '186',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Jackson',
      'picture_file': '_Jackson',
      'suffix': '',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'jackson@email.com',
        'notification_email': 'jackson@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '187',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },

      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Maurice',
      'suffix': '',
      'picture_file': '_Maurice',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'maurice@email.com',
        'notification_email': 'maurice@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '188',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Dumas',
      'suffix': '',
      'picture_file': '_Dumas',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'dumas@email.com',
        'notification_email': 'dumas@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '189',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'DeVore-Strokes',
      'suffix': '',
      'picture_file': '_DeVore-Strokes',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'devore-strokes@email.com',
        'notification_email': 'devore-strokes@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '190',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Green',
      'suffix': '',
      'picture_file': '_Green',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'green@email.com',
        'notification_email': 'green@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '191',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Paulos',
      'suffix': '',
      'picture_file': '_Paulos',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'paulos@email.com',
        'notification_email': 'paulos@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '192',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Daley-Perdomo',
      'suffix': '',
      'picture_file': '_Daley-Perdomo',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'daley-perdomo@email.com',
        'notification_email': 'daley-perdomo@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '193',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Harris',
      'suffix': '',
      'picture_file': '_Harris',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'harris@email.com',
        'notification_email': 'harris@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '194',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Figgins',
      'suffix': '',
      'picture_file': '_Figgins',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'friggins@email.com',
        'notification_email': 'friggins@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '195',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Quinn',
      'suffix': '',
      'picture_file': '_Quinn',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'quinn@email.com',
        'notification_email': 'quinn@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '196',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Wilson',
      'suffix': '',
      'picture_file': '_Wilson',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'wilson@email.com',
        'notification_email': 'wilson@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '197',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Gilmore',
      'suffix': '',
      'picture_file': '_Gilmore',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'gilmore@email.com',
        'notification_email': 'gilmore@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '198',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Brown',
      'suffix': '',
      'picture_file': '_Brown',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'brown@email.com',
        'notification_email': 'brown@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '199',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Gilmer',
      'suffix': '',
      'picture_file': '_Gilmer',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'gilmer@email.com',
        'notification_email': 'gilmer@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '200',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'last_name': 'Coker',
      'suffix': '',
      'picture_file': '_Coker',
      'middle_name': '',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'coker@email.com',
        'notification_email': 'coker@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '201',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Spears',
      'suffix': '',
      'picture_file': '_Spears',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'spears@email.com',
        'notification_email': 'spears@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '202',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Parker',
      'suffix': '',
      'picture_file': '_Parker',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'parker@email.com',
        'notification_email': 'parker@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '203',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Pereyra',
      'suffix': '',
      'picture_file': '_Pereyra',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'pereyra@email.com',
        'notification_email': 'pereyra@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '204',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Woolridge',
      'suffix': '',
      'picture_file': '_Woolridge',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'woolridge@email.com',
        'notification_email': 'woolridge@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '205',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Campbell',
      'suffix': '',
      'picture_file': '_Campbell',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'campbell@email.com',
        'notification_email': 'campbell@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '206',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Terry',
      'suffix': '',
      'picture_file': '_Terry',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'terry@email.com',
        'notification_email': 'terry@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '207',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Mitchell',
      'suffix': '',
      'picture_file': '_Mitchell',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'mitchell@email.com',
        'notification_email': 'mitchell@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '208',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Segwa',
      'suffix': '',
      'picture_file': '_Segwa',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'segwa@email.com',
        'notification_email': 'segwa@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '209',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Pinkett',
      'suffix': '',
      'picture_file': '_Pinkett',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'pinkett@email.com',
        'notification_email': 'pinkett@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '210',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Laidler',
      'suffix': '',
      'picture_file': '_Laidler',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'laidler@email.com',
        'notification_email': 'laidler@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    },
    {
      'uuid': '211',
      'has_permissions': {
        'canLogin': true,
        'canReceiveNotifications': true,
        'managePerformances': false,
        'manageCasts': false,
        'manageBallets': false,
        'manageRoles': false,
        'manageRules': false
      },
      'has_roles': {
        'isAdmin': false,
        'isChoreographer': false,
        'isDancer': true,
        'isOther': false,
      },
      'knows_positions': [],
      'first_name': ' ',
      'middle_name': '',
      'last_name': 'Stamatiou',
      'suffix': '',
      'picture_file': '_Stamatiou',
      'date_joined': 1596168000000,
      'contact_info': {
        'phone_number': 'N/A',
        'email': 'stamatiou@email.com',
        'notification_email': 'stamatiou@email.com',
        'emergency_contact': {
          'name': '',
          'phone_number': '',
          'email': 'N/A'
        }
      }
    }
  ];


  /** Mocks backend response */
  requestAllUsers(): Promise<AllUsersResponse> {
    return Promise.resolve({
      data: {
        users: this.mockUserDB
      },
      warnings: []
    });
  }

  /** Mocks backend response */
  requestOneUser(uuid: APITypes.UserUUID): Promise<OneUserResponse> {
    return Promise.resolve({
      data: {
        user: this.mockUserDB.find(val => {
          return val.uuid === uuid || val.uuid === uuid;
        })
      },
      warnings: []
    });
  }

  requestUserSet(user: User): Promise<HttpResponse<any>> {
    if (this.isValidUser(user)) {
      const userInd = this.mockUserDB.findIndex(
          (val) => val.uuid === user.uuid);
      if (userInd === -1) {
        this.mockUserDB.push(user);
      } else {
        this.mockUserDB[userInd] = user;
      }
      return Promise.resolve({
        status: 200
      } as HttpResponse<any>);
    } else {
      return Promise.resolve({
        status: 400
      } as HttpResponse<any>);
    }
  }

  /** Mocks user delete response */
  requestUserDelete(user: User): Promise<HttpResponse<any>> {
    this.mockUserDB = this.mockUserDB.filter(val => val.uuid !== user.uuid);
    return Promise.resolve({
      status: 200
    } as HttpResponse<any>);
  }

  /** Checks if user is valid, like the backend */
  public isValidUser(user: User): boolean {
    return !isNullOrUndefined(user.uuid) && !isNullOrUndefined(
        user.contact_info.email) && !isNullOrUndefined(user.first_name) &&
           !isNullOrUndefined(user.last_name) && !isNullOrUndefined(
            user.has_permissions);
  }

}
