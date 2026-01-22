export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      plan?: "free" | "pro" | "premium";
      role?: "STUDENT" | "TEACHER" | "ADMIN";
      dbUserId?: string;
    };
  }
}
