/**
 * All the static app-wide types that need to be
 * used in constants or utilities
 */
export namespace AppTypes {
  export type NavBarChild = {
    name: string,
    routerLinkUrl: string,
    icon: string
  }
}

/**
 * All the types neeeded for APIs
 */
export namespace APITypes {
  export type UserUUID = string;
  export type PrivilegeClassUUID = string;
  export type PieceUUID = string;
  export type SuccessIndicator = {
    successful: boolean,
    error?: string
  }
}