import { HttpResponse } from '@angular/common/http';
import { APITypes } from 'src/api_types';
import { isNullOrUndefined } from 'util';
import { AllUsersResponse, OneUserResponse, User } from "../api/user_api.service";

/**
 * Mocks the user backend responses
 */
export class MockUserBackend {

  /** Mock user database */
  mockUserDB: User[] = [
    {
      "uuid": "1",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": "System",
      "last_name": "Admin",
      "date_joined": null,
      "contact_info": {
        "phone_number": "N/A",
        "email": "admin@rolecall.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "183",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Bozeman",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "bozeman@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "184",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Monteiro",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "monteiro@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "185",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Lebrun",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "lebrun@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "186",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Jackson",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "jackson@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "187",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },

      "knows_positions": [],
      "first_name": " ",
      "last_name": "Maurice",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "maurice@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "188",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Dumas",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "dumas@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "189",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "DeVore-Strokes",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "devore-strokes@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "190",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Green",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "green@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "191",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Paulos",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "paulos@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "192",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Daley-Perdomo",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "daley-perdomo@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "193",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Harris",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "harris@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "194",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Figgins",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "friggins@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "195",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Quinn",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "quinn@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "196",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
     "knows_positions": [],
      "first_name": " ",
      "last_name": "Wilson",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "wilson@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "197",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Gilmore",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "gilmore@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "198",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Brown",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "brown@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "199",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Gilmer",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "gilmer@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "200",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Coker",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "coker@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "201",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Spears",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "spears@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "202",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Parker",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "parker@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "203",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Pereyra",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "pereyra@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "204",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Woolridge",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "woolridge@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "205",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Campbell",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "campbell@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "206",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Terry",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "terry@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "207",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Mitchell",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "mitchell@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "208",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Segwa",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "segwa@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "209",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Pinkett",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "pinkett@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "210",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Laidler",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "laidler@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    },
    {
      "uuid": "211",
      "has_permissions": {
        "canLogin": true,
        "canReceiveNotifications": true,
        "managePerformances": false,
        "manageCasts": false,
        "managePieces": false,
        "manageRoles": false,
        "manageRules": false
      },
      "has_roles": {
        "isAdmin": false,
        "isCoreographer": false,
        "isDancer": true,
        "isOther": false,
      },
      "knows_positions": [],
      "first_name": " ",
      "last_name": "Stamatiou",
      "date_joined": 1596168000000,
      "contact_info": {
        "phone_number": "N/A",
        "email": "stamatiou@email.com",
        "emergency_contact": {
          "name": "",
          "phone_number": "",
          "email": "N/A"
        }
      }
    }
  ];
  // [
  //   {
  //     uuid: "USERUUID1",
  //     has_permissions: {
  //       isAdmin: true,
  //       canReceiveNotifications: true,
  //       canLogin: true,
  //       manageCasts: true,
  //       managePerformances: true,
  //       managePieces: true,
  //       manageRoles: true,
  //       manageRules: true
  //     },
  //     knows_positions: [
  //       {
  //         segment: "PIECE1UUID",
  //         position: "Lead"
  //       },
  //       {
  //         segment: "PIECE2UUID",
  //         position: "Background"
  //       }
  //     ],
  //     has_privilege_classes: [
  //       "admin"
  //     ],
  //     first_name: "USER1First",
  //     last_name: "USER1Last",
  //     contact_info: {
  //       phone_number: "1123456789",
  //       email: "USER1@gmail.com",
  //       emergency_contact: {
  //         name: "USER1 Emergency Contact Name",
  //         phone_number: "1198765432",
  //         email: "USER1EMG@gmail.com"
  //       }
  //     },
  //     date_joined: 1000000000
  //   },
  //   {
  //     uuid: "USERUUID2",
  //     has_permissions: {
  //       isAdmin: false,
  //       canReceiveNotifications: true,
  //       canLogin: true,
  //       manageCasts: true,
  //       managePerformances: false,
  //       managePieces: true,
  //       manageRoles: false,
  //       manageRules: false
  //     },
  //     knows_positions: [
  //       {
  //         segment: "PIECE1UUID",
  //         position: "Background"
  //       },
  //       {
  //         segment: "PIECE2UUID",
  //         position: "Lead"
  //       }
  //     ],
  //     has_privilege_classes: [
  //       "choreographer"
  //     ],
  //     first_name: "USER2First",
  //     last_name: "USER2Last",
  //     contact_info: {
  //       phone_number: "2123456789",
  //       email: "USER2@gmail.com",
  //       emergency_contact: {
  //         name: "USER2 Emergency Contact Name",
  //         phone_number: "2198765432",
  //         email: "USER2EMG@gmail.com"
  //       }
  //     },
  //     date_joined: 1000000000
  //   }
  // ];

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
        user: this.mockUserDB.find(val => { return val.uuid == uuid || val.uuid === uuid })
      },
      warnings: []
    });
  };


  requestUserSet(user: User): Promise<HttpResponse<any>> {
    if (this.isValidUser(user)) {
      let userInd = this.mockUserDB.findIndex((val) => val.uuid == user.uuid);
      if (userInd == -1) {
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
    this.mockUserDB = this.mockUserDB.filter(val => val.uuid != user.uuid);
    return Promise.resolve({
      status: 200
    } as HttpResponse<any>);
  }

  /** Checks if user is valid, like the backend */
  public isValidUser(user: User): boolean {
    return !isNullOrUndefined(user.uuid) && !isNullOrUndefined(user.contact_info.email) && !isNullOrUndefined(user.first_name) &&
      !isNullOrUndefined(user.last_name) && !isNullOrUndefined(user.has_permissions);
  }

}