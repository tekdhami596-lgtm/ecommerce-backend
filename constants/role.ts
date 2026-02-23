export const BUYER  = "buyer"  as const;
export const SELLER = "seller" as const;
export const ADMIN  = "admin"  as const;
export type UserRole = typeof BUYER | typeof SELLER | typeof ADMIN;