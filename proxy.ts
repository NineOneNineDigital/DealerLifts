import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isAuthedRoute = createRouteMatcher(["/account(.*)", "/orders(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAuthedRoute(req)) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|api/webhooks|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api(?!/webhooks)|trpc)(.*)",
  ],
};
