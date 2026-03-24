import { clerkMiddleware } from "@clerk/nextjs/server";

// TODO: Re-enable admin auth checks once Clerk sign-in is working
// Admin route protection is temporarily disabled for development
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|api/webhooks|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api(?!/webhooks)|trpc)(.*)",
  ],
};
