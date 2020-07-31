import { HttpResponse } from '@angular/common/http';
import { APITypes } from 'src/types';
import { AllCastsResponse, Cast, OneCastResponse } from '../api/cast_api.service';

/**
 * Mocks the cast backend responses
 */
export class MockCastBackend {

  /** Mock cast database */
  mockCastDB: Cast[] = [
    {
      "uuid": "229",
      "name": "2020 Tour Roster",
      "segment": "212",
      "filled_positions": [
        {
          "position_uuid": "Dancer",
          "groups": [
            {
              "position_uuid": "Dancer",
              "group_index": 0,
              "members": [
                {
                  "uuid": "186",
                  "position_number": 3
                },
                {
                  "uuid": "183",
                  "position_number": 0
                },
                {
                  "uuid": "188",
                  "position_number": 5
                },
                {
                  "uuid": "187",
                  "position_number": 4
                },
                {
                  "uuid": "185",
                  "position_number": 2
                },
                {
                  "uuid": "184",
                  "position_number": 1
                }
              ]
            },
            {
              "position_uuid": "Dancer",
              "group_index": 1,
              "members": [
                {
                  "uuid": "192",
                  "position_number": 3
                },
                {
                  "uuid": "190",
                  "position_number": 1
                },
                {
                  "uuid": "189",
                  "position_number": 0
                },
                {
                  "uuid": "191",
                  "position_number": 2
                },
                {
                  "uuid": "194",
                  "position_number": 5
                },
                {
                  "uuid": "193",
                  "position_number": 4
                }
              ]
            },
            {
              "position_uuid": "Dancer",
              "group_index": 2,
              "members": [
                {
                  "uuid": "195",
                  "position_number": 0
                },
                {
                  "uuid": "196",
                  "position_number": 2
                }
              ]
            }
          ]
        },
        {
          "position_uuid": "Dancer",
          "groups": [
            {
              "position_uuid": "Dancer",
              "group_index": 0,
              "members": [
                {
                  "uuid": "186",
                  "position_number": 3
                },
                {
                  "uuid": "183",
                  "position_number": 0
                },
                {
                  "uuid": "188",
                  "position_number": 5
                },
                {
                  "uuid": "187",
                  "position_number": 4
                },
                {
                  "uuid": "185",
                  "position_number": 2
                },
                {
                  "uuid": "184",
                  "position_number": 1
                }
              ]
            },
            {
              "position_uuid": "Dancer",
              "group_index": 1,
              "members": [
                {
                  "uuid": "192",
                  "position_number": 3
                },
                {
                  "uuid": "190",
                  "position_number": 1
                },
                {
                  "uuid": "189",
                  "position_number": 0
                },
                {
                  "uuid": "191",
                  "position_number": 2
                },
                {
                  "uuid": "194",
                  "position_number": 5
                },
                {
                  "uuid": "193",
                  "position_number": 4
                }
              ]
            },
            {
              "position_uuid": "Dancer",
              "group_index": 2,
              "members": [
                {
                  "uuid": "195",
                  "position_number": 0
                },
                {
                  "uuid": "196",
                  "position_number": 2
                }
              ]
            }
          ]
        },
        {
          "position_uuid": "Dancer",
          "groups": [
            {
              "position_uuid": "Dancer",
              "group_index": 0,
              "members": [
                {
                  "uuid": "186",
                  "position_number": 3
                },
                {
                  "uuid": "183",
                  "position_number": 0
                },
                {
                  "uuid": "188",
                  "position_number": 5
                },
                {
                  "uuid": "187",
                  "position_number": 4
                },
                {
                  "uuid": "185",
                  "position_number": 2
                },
                {
                  "uuid": "184",
                  "position_number": 1
                }
              ]
            },
            {
              "position_uuid": "Dancer",
              "group_index": 1,
              "members": [
                {
                  "uuid": "192",
                  "position_number": 3
                },
                {
                  "uuid": "190",
                  "position_number": 1
                },
                {
                  "uuid": "189",
                  "position_number": 0
                },
                {
                  "uuid": "191",
                  "position_number": 2
                },
                {
                  "uuid": "194",
                  "position_number": 5
                },
                {
                  "uuid": "193",
                  "position_number": 4
                }
              ]
            },
            {
              "position_uuid": "Dancer",
              "group_index": 2,
              "members": [
                {
                  "uuid": "195",
                  "position_number": 0
                },
                {
                  "uuid": "196",
                  "position_number": 2
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "uuid": "249",
      "name": "2020 Tour Roster",
      "segment": "247",
      "filled_positions": [
        {
          "position_uuid": "Dancer - Fandango",
          "groups": [
            {
              "position_uuid": "Dancer - Fandango",
              "group_index": 0,
              "members": [
                {
                  "uuid": "191",
                  "position_number": 0
                },
                {
                  "uuid": "198",
                  "position_number": 1
                }
              ]
            },
            {
              "position_uuid": "Dancer - Fandango",
              "group_index": 1,
              "members": [
                {
                  "uuid": "193",
                  "position_number": 0
                },
                {
                  "uuid": "185",
                  "position_number": 1
                }
              ]
            }
          ]
        },
        {
          "position_uuid": "Dancer - Fandango",
          "groups": [
            {
              "position_uuid": "Dancer - Fandango",
              "group_index": 0,
              "members": [
                {
                  "uuid": "191",
                  "position_number": 0
                },
                {
                  "uuid": "198",
                  "position_number": 1
                }
              ]
            },
            {
              "position_uuid": "Dancer - Fandango",
              "group_index": 1,
              "members": [
                {
                  "uuid": "193",
                  "position_number": 0
                },
                {
                  "uuid": "185",
                  "position_number": 1
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "uuid": "266",
      "name": "2020 Tour Roster",
      "segment": "214",
      "filled_positions": [
        {
          "position_uuid": "Seeking, Resting, and Moving On",
          "groups": [
            {
              "position_uuid": "Seeking, Resting, and Moving On",
              "group_index": 0,
              "members": [
                {
                  "uuid": "193",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Seeking, Resting, and Moving On",
              "group_index": 2,
              "members": [
                {
                  "uuid": "184",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Seeking, Resting, and Moving On",
              "group_index": 3,
              "members": [
                {
                  "uuid": "189",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Seeking, Resting, and Moving On",
              "group_index": 1,
              "members": [
                {
                  "uuid": "211",
                  "position_number": 0
                }
              ]
            }
          ]
        },
        {
          "position_uuid": "Resting and Moving On",
          "groups": [
            {
              "position_uuid": "Resting and Moving On",
              "group_index": 1,
              "members": [
                {
                  "uuid": "196",
                  "position_number": 3
                },
                {
                  "uuid": "188",
                  "position_number": 2
                },
                {
                  "uuid": "209",
                  "position_number": 1
                },
                {
                  "uuid": "195",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Resting and Moving On",
              "group_index": 2,
              "members": [
                {
                  "uuid": "187",
                  "position_number": 2
                },
                {
                  "uuid": "204",
                  "position_number": 3
                }
              ]
            },
            {
              "position_uuid": "Resting and Moving On",
              "group_index": 0,
              "members": [
                {
                  "uuid": "194",
                  "position_number": 0
                },
                {
                  "uuid": "184",
                  "position_number": 2
                },
                {
                  "uuid": "191",
                  "position_number": 1
                },
                {
                  "uuid": "183",
                  "position_number": 3
                }
              ]
            }
          ]
        },
        {
          "position_uuid": "Seeking, Resting, and Moving On",
          "groups": [
            {
              "position_uuid": "Seeking, Resting, and Moving On",
              "group_index": 0,
              "members": [
                {
                  "uuid": "193",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Seeking, Resting, and Moving On",
              "group_index": 2,
              "members": [
                {
                  "uuid": "184",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Seeking, Resting, and Moving On",
              "group_index": 3,
              "members": [
                {
                  "uuid": "189",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Seeking, Resting, and Moving On",
              "group_index": 1,
              "members": [
                {
                  "uuid": "211",
                  "position_number": 0
                }
              ]
            }
          ]
        },
        {
          "position_uuid": "Moving On",
          "groups": [
            {
              "position_uuid": "Moving On",
              "group_index": 0,
              "members": [
                {
                  "uuid": "189",
                  "position_number": 0
                },
                {
                  "uuid": "187",
                  "position_number": 2
                },
                {
                  "uuid": "186",
                  "position_number": 4
                },
                {
                  "uuid": "205",
                  "position_number": 3
                },
                {
                  "uuid": "203",
                  "position_number": 1
                }
              ]
            },
            {
              "position_uuid": "Moving On",
              "group_index": 2,
              "members": [
                {
                  "uuid": "208",
                  "position_number": 2
                },
                {
                  "uuid": "195",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Moving On",
              "group_index": 1,
              "members": [
                {
                  "uuid": "206",
                  "position_number": 4
                },
                {
                  "uuid": "210",
                  "position_number": 0
                },
                {
                  "uuid": "207",
                  "position_number": 1
                },
                {
                  "uuid": "200",
                  "position_number": 2
                },
                {
                  "uuid": "201",
                  "position_number": 3
                }
              ]
            }
          ]
        },
        {
          "position_uuid": "Seeking, Resting, and Moving On",
          "groups": [
            {
              "position_uuid": "Seeking, Resting, and Moving On",
              "group_index": 0,
              "members": [
                {
                  "uuid": "193",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Seeking, Resting, and Moving On",
              "group_index": 2,
              "members": [
                {
                  "uuid": "184",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Seeking, Resting, and Moving On",
              "group_index": 3,
              "members": [
                {
                  "uuid": "189",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Seeking, Resting, and Moving On",
              "group_index": 1,
              "members": [
                {
                  "uuid": "211",
                  "position_number": 0
                }
              ]
            }
          ]
        },
        {
          "position_uuid": "Moving On",
          "groups": [
            {
              "position_uuid": "Moving On",
              "group_index": 0,
              "members": [
                {
                  "uuid": "189",
                  "position_number": 0
                },
                {
                  "uuid": "187",
                  "position_number": 2
                },
                {
                  "uuid": "186",
                  "position_number": 4
                },
                {
                  "uuid": "205",
                  "position_number": 3
                },
                {
                  "uuid": "203",
                  "position_number": 1
                }
              ]
            },
            {
              "position_uuid": "Moving On",
              "group_index": 2,
              "members": [
                {
                  "uuid": "208",
                  "position_number": 2
                },
                {
                  "uuid": "195",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Moving On",
              "group_index": 1,
              "members": [
                {
                  "uuid": "206",
                  "position_number": 4
                },
                {
                  "uuid": "210",
                  "position_number": 0
                },
                {
                  "uuid": "207",
                  "position_number": 1
                },
                {
                  "uuid": "200",
                  "position_number": 2
                },
                {
                  "uuid": "201",
                  "position_number": 3
                }
              ]
            }
          ]
        },
        {
          "position_uuid": "Seeking, Resting, and Moving On",
          "groups": [
            {
              "position_uuid": "Seeking, Resting, and Moving On",
              "group_index": 0,
              "members": [
                {
                  "uuid": "193",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Seeking, Resting, and Moving On",
              "group_index": 2,
              "members": [
                {
                  "uuid": "184",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Seeking, Resting, and Moving On",
              "group_index": 3,
              "members": [
                {
                  "uuid": "189",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Seeking, Resting, and Moving On",
              "group_index": 1,
              "members": [
                {
                  "uuid": "211",
                  "position_number": 0
                }
              ]
            }
          ]
        },
        {
          "position_uuid": "Resting and Moving On",
          "groups": [
            {
              "position_uuid": "Resting and Moving On",
              "group_index": 1,
              "members": [
                {
                  "uuid": "196",
                  "position_number": 3
                },
                {
                  "uuid": "188",
                  "position_number": 2
                },
                {
                  "uuid": "209",
                  "position_number": 1
                },
                {
                  "uuid": "195",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Resting and Moving On",
              "group_index": 2,
              "members": [
                {
                  "uuid": "187",
                  "position_number": 2
                },
                {
                  "uuid": "204",
                  "position_number": 3
                }
              ]
            },
            {
              "position_uuid": "Resting and Moving On",
              "group_index": 0,
              "members": [
                {
                  "uuid": "194",
                  "position_number": 0
                },
                {
                  "uuid": "184",
                  "position_number": 2
                },
                {
                  "uuid": "191",
                  "position_number": 1
                },
                {
                  "uuid": "183",
                  "position_number": 3
                }
              ]
            }
          ]
        },
        {
          "position_uuid": "Moving On",
          "groups": [
            {
              "position_uuid": "Moving On",
              "group_index": 0,
              "members": [
                {
                  "uuid": "189",
                  "position_number": 0
                },
                {
                  "uuid": "187",
                  "position_number": 2
                },
                {
                  "uuid": "186",
                  "position_number": 4
                },
                {
                  "uuid": "205",
                  "position_number": 3
                },
                {
                  "uuid": "203",
                  "position_number": 1
                }
              ]
            },
            {
              "position_uuid": "Moving On",
              "group_index": 2,
              "members": [
                {
                  "uuid": "208",
                  "position_number": 2
                },
                {
                  "uuid": "195",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Moving On",
              "group_index": 1,
              "members": [
                {
                  "uuid": "206",
                  "position_number": 4
                },
                {
                  "uuid": "210",
                  "position_number": 0
                },
                {
                  "uuid": "207",
                  "position_number": 1
                },
                {
                  "uuid": "200",
                  "position_number": 2
                },
                {
                  "uuid": "201",
                  "position_number": 3
                }
              ]
            }
          ]
        },
        {
          "position_uuid": "Resting and Moving On",
          "groups": [
            {
              "position_uuid": "Resting and Moving On",
              "group_index": 1,
              "members": [
                {
                  "uuid": "196",
                  "position_number": 3
                },
                {
                  "uuid": "188",
                  "position_number": 2
                },
                {
                  "uuid": "209",
                  "position_number": 1
                },
                {
                  "uuid": "195",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Resting and Moving On",
              "group_index": 2,
              "members": [
                {
                  "uuid": "187",
                  "position_number": 2
                },
                {
                  "uuid": "204",
                  "position_number": 3
                }
              ]
            },
            {
              "position_uuid": "Resting and Moving On",
              "group_index": 0,
              "members": [
                {
                  "uuid": "194",
                  "position_number": 0
                },
                {
                  "uuid": "184",
                  "position_number": 2
                },
                {
                  "uuid": "191",
                  "position_number": 1
                },
                {
                  "uuid": "183",
                  "position_number": 3
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "uuid": "360",
      "name": "2020 Tour Roster",
      "segment": "358",
      "filled_positions": [
        {
          "position_uuid": "Dancer - Ella",
          "groups": [
            {
              "position_uuid": "Dancer - Ella",
              "group_index": 1,
              "members": [
                {
                  "uuid": "191",
                  "position_number": 1
                },
                {
                  "uuid": "189",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Dancer - Ella",
              "group_index": 0,
              "members": [
                {
                  "uuid": "194",
                  "position_number": 0
                },
                {
                  "uuid": "193",
                  "position_number": 1
                }
              ]
            },
            {
              "position_uuid": "Dancer - Ella",
              "group_index": 3,
              "members": [
                {
                  "uuid": "209",
                  "position_number": 1
                },
                {
                  "uuid": "200",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Dancer - Ella",
              "group_index": 2,
              "members": [
                {
                  "uuid": "187",
                  "position_number": 1
                },
                {
                  "uuid": "184",
                  "position_number": 0
                }
              ]
            }
          ]
        },
        {
          "position_uuid": "Dancer - Ella",
          "groups": [
            {
              "position_uuid": "Dancer - Ella",
              "group_index": 1,
              "members": [
                {
                  "uuid": "191",
                  "position_number": 1
                },
                {
                  "uuid": "189",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Dancer - Ella",
              "group_index": 0,
              "members": [
                {
                  "uuid": "194",
                  "position_number": 0
                },
                {
                  "uuid": "193",
                  "position_number": 1
                }
              ]
            },
            {
              "position_uuid": "Dancer - Ella",
              "group_index": 3,
              "members": [
                {
                  "uuid": "209",
                  "position_number": 1
                },
                {
                  "uuid": "200",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Dancer - Ella",
              "group_index": 2,
              "members": [
                {
                  "uuid": "187",
                  "position_number": 1
                },
                {
                  "uuid": "184",
                  "position_number": 0
                }
              ]
            }
          ]
        },
        {
          "position_uuid": "Dancer - Ella",
          "groups": [
            {
              "position_uuid": "Dancer - Ella",
              "group_index": 1,
              "members": [
                {
                  "uuid": "191",
                  "position_number": 1
                },
                {
                  "uuid": "189",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Dancer - Ella",
              "group_index": 0,
              "members": [
                {
                  "uuid": "194",
                  "position_number": 0
                },
                {
                  "uuid": "193",
                  "position_number": 1
                }
              ]
            },
            {
              "position_uuid": "Dancer - Ella",
              "group_index": 3,
              "members": [
                {
                  "uuid": "209",
                  "position_number": 1
                },
                {
                  "uuid": "200",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Dancer - Ella",
              "group_index": 2,
              "members": [
                {
                  "uuid": "187",
                  "position_number": 1
                },
                {
                  "uuid": "184",
                  "position_number": 0
                }
              ]
            }
          ]
        },
        {
          "position_uuid": "Dancer - Ella",
          "groups": [
            {
              "position_uuid": "Dancer - Ella",
              "group_index": 1,
              "members": [
                {
                  "uuid": "191",
                  "position_number": 1
                },
                {
                  "uuid": "189",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Dancer - Ella",
              "group_index": 0,
              "members": [
                {
                  "uuid": "194",
                  "position_number": 0
                },
                {
                  "uuid": "193",
                  "position_number": 1
                }
              ]
            },
            {
              "position_uuid": "Dancer - Ella",
              "group_index": 3,
              "members": [
                {
                  "uuid": "209",
                  "position_number": 1
                },
                {
                  "uuid": "200",
                  "position_number": 0
                }
              ]
            },
            {
              "position_uuid": "Dancer - Ella",
              "group_index": 2,
              "members": [
                {
                  "uuid": "187",
                  "position_number": 1
                },
                {
                  "uuid": "184",
                  "position_number": 0
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  // [
  //   {
  //     uuid: "CAST1UUID",
  //     name: "Cast 1",
  //     segment: "PIECE1UUID",
  //     filled_positions: [{
  //       position_uuid: "piece1pos1",
  //       groups: [
  //         {
  //           group_index: 0,
  //           members: [{
  //             uuid: "USERUUID1",
  //             position_number: 0
  //           },
  //           {
  //             uuid: "USERUUID2",
  //             position_number: 1
  //           },
  //           {
  //             uuid: "USERUUID2",
  //             position_number: 2
  //           }]
  //         },
  //         {
  //           group_index: 1,
  //           members: [{
  //             uuid: "USERUUID2",
  //             position_number: 0
  //           }, {
  //             uuid: "USERUUID1",
  //             position_number: 2
  //           }]
  //         },
  //         {
  //           group_index: 2,
  //           members: [{
  //             uuid: "USERUUID1",
  //             position_number: 2
  //           }]
  //         }
  //       ],
  //     },
  //     {
  //       position_uuid: "piece1pos2",
  //       groups: [
  //         {
  //           group_index: 0,
  //           members: [{
  //             uuid: "USERUUID1",
  //             position_number: 0
  //           },
  //           {
  //             uuid: "USERUUID2",
  //             position_number: 1
  //           },
  //           {
  //             uuid: "USERUUID2",
  //             position_number: 2
  //           }]
  //         },
  //         {
  //           group_index: 1,
  //           members: [{
  //             uuid: "USERUUID2",
  //             position_number: 0
  //           }, {
  //             uuid: "USERUUID1",
  //             position_number: 2
  //           }]
  //         },
  //         {
  //           group_index: 2,
  //           members: [{
  //             uuid: "USERUUID1",
  //             position_number: 2
  //           }]
  //         }
  //       ],
  //     }]
  //   },
  //   {
  //     uuid: "CAST2UUID",
  //     name: "Cast 2",
  //     segment: "PIECE2UUID",
  //     filled_positions: [{
  //       position_uuid: "piece2pos1",
  //       groups: [
  //         {
  //           group_index: 0,
  //           members: [{
  //             uuid: "USERUUID1",
  //             position_number: 0
  //           },
  //           {
  //             uuid: "USERUUID2",
  //             position_number: 1
  //           },
  //           {
  //             uuid: "USERUUID2",
  //             position_number: 2
  //           }]
  //         },
  //         {
  //           group_index: 1,
  //           members: [{
  //             uuid: "USERUUID2",
  //             position_number: 0
  //           }, {
  //             uuid: "USERUUID1",
  //             position_number: 2
  //           }]
  //         },
  //         {
  //           group_index: 2,
  //           members: [{
  //             uuid: "USERUUID1",
  //             position_number: 2
  //           }]
  //         }
  //       ],
  //     },
  //     {
  //       position_uuid: "piece2pos2",
  //       groups: [
  //         {
  //           group_index: 0,
  //           members: [{
  //             uuid: "USERUUID1",
  //             position_number: 0
  //           },
  //           {
  //             uuid: "USERUUID2",
  //             position_number: 1
  //           },
  //           {
  //             uuid: "USERUUID2",
  //             position_number: 2
  //           }]
  //         },
  //         {
  //           group_index: 1,
  //           members: [{
  //             uuid: "USERUUID2",
  //             position_number: 0
  //           }, {
  //             uuid: "USERUUID1",
  //             position_number: 2
  //           }]
  //         },
  //         {
  //           group_index: 2,
  //           members: [{
  //             uuid: "USERUUID1",
  //             position_number: 2
  //           }]
  //         }
  //       ],
  //     },
  //     {
  //       position_uuid: "piece2pos3",
  //       groups: [
  //         {
  //           group_index: 0,
  //           members: [{
  //             uuid: "USERUUID1",
  //             position_number: 0
  //           },
  //           {
  //             uuid: "USERUUID2",
  //             position_number: 1
  //           },
  //           {
  //             uuid: "USERUUID2",
  //             position_number: 2
  //           }]
  //         },
  //         {
  //           group_index: 1,
  //           members: [{
  //             uuid: "USERUUID2",
  //             position_number: 0
  //           }, {
  //             uuid: "USERUUID1",
  //             position_number: 2
  //           }]
  //         },
  //         {
  //           group_index: 2,
  //           members: [{
  //             uuid: "USERUUID1",
  //             position_number: 2
  //           }]
  //         }
  //       ],
  //     }]
  //   }
  // ];
  shouldRejectSetRequest = false;

  /** Mocks backend response */
  requestAllCasts(): Promise<AllCastsResponse> {
    return Promise.resolve({
      data: {
        casts: this.mockCastDB
      },
      warnings: []
    });
  }

  /** Mocks backend response */
  requestOneCast(uuid: APITypes.CastUUID): Promise<OneCastResponse> {
    return Promise.resolve({
      data: {
        cast: this.mockCastDB.find(val => { return val.uuid == uuid || val.uuid === uuid })
      },
      warnings: []
    });
  };

  /** Mocks cast create/edit response */
  requestCastSet(cast: Cast): Promise<HttpResponse<any>> {
    if (!this.shouldRejectSetRequest) {
      let castInd = this.mockCastDB.findIndex((val) => val.uuid == cast.uuid);
      if (castInd == -1) {
        this.mockCastDB.push(cast);
      } else {
        this.mockCastDB[castInd] = cast;
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

  /** Mocks cast delete response */
  requestCastDelete(cast: Cast): Promise<HttpResponse<any>> {
    this.mockCastDB = this.mockCastDB.filter(val => val.uuid != cast.uuid);
    return Promise.resolve({
      status: 200
    } as HttpResponse<any>);
  }

}