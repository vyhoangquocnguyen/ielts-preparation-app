export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      plan?: "FREE" | "PRO" | "PREMIUM";
      role?: "STUDENT" | "TEACHER" | "ADMIN";
      dbUserId?: string;
    };
  }
}
