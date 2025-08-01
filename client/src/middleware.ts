import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// middleware to protect student routes and teacher routes
const isStudentRoute = createRouteMatcher(["/user/(.*)"]);
const isTeacherRoute = createRouteMatcher(["/teacher/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();

  const userRole =
    (sessionClaims?.userType as "student" | "teacher") || "student";

  // if userRole is not a student, redirect to teacher courses
  if (isStudentRoute(req) && userRole !== "student") {
    const url = new URL("/teacher/courses", req.url);
    return NextResponse.redirect(url);
  }

  // if userRole is not a teacher, redirect to student courses
  if (isTeacherRoute(req) && userRole !== "teacher") {
    const url = new URL("/user/courses", req.url);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
