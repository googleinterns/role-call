export enum PerformanceStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  CANCELED = "CANCELED"
}

/**
 * All the types neeeded for APIs
 */
export namespace APITypes {
  export type UserUUID = string;
  export type PrivilegeClassUUID = string;
  export type PieceUUID = string;
  export type CastUUID = string;
  export type PerformanceUUID = string;
  export type SuccessIndicator = {
    successful: boolean,
    error?: string
  };
  export type PermissionSet = {
    canLogin: boolean,
    isAdmin: boolean,
    notifications: boolean,
    managePerformances: boolean,
    manageCasts: boolean,
    managePieces: boolean,
    manageRoles: boolean,
    manageRules: boolean
  };
  export type Position = {
    segment: PieceUUID,
    position: string
  };
}