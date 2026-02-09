import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/", "/api/webhooks(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  if (isPublicRoute(request)) return NextResponse.next();

  if (!userId) return redirectToSignIn({ returnBackUrl: request.url });

  // Instant role check using the optimized JWT
  const userRole = sessionClaims?.metadata?.role;

  if (isAdminRoute(request) && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
