export enum PerformanceStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELED = 'CANCELED'
}

/** All the types needed for APIs. */
export namespace APITypes {
  export type UserUUID = string;
  export type PieceUUID = string;
  export type CastUUID = string;
  export type PerformanceUUID = string;
  export type UnavailabilityUUID = number;
  export type SuccessIndicator = {
    successful: boolean;
    error?: string;
  };
  export type Roles = {
    isAdmin: boolean;
    isCoreographer: boolean;
    isDancer: boolean;
    isOther: boolean;
  };
  export type Permissions = {
    canLogin: boolean;
    canReceiveNotifications: boolean;
    managePerformances: boolean;
    manageCasts: boolean;
    managePieces: boolean;
    manageRoles: boolean;
    manageRules: boolean;
  };
  export type Position = {
    segment: PieceUUID;
    position: string;
  };
}
