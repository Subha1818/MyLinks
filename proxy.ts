import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/server/auth";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Only protect /dashboard and /onboarding
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
