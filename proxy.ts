import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/server/auth";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Only protect /dashboard and /onboarding
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
    const sessionRes = await auth.api.getSession({
      headers: request.headers,
      returnHeaders: true,
    });
    
    const session = sessionRes?.response;
    
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    const response = NextResponse.next();
    if (sessionRes?.headers) {
      const setCookies = sessionRes.headers.getSetCookie
        ? sessionRes.headers.getSetCookie()
        : [sessionRes.headers.get("set-cookie")].filter(Boolean) as string[];
      for (const cookie of setCookies) {
        response.headers.append("set-cookie", cookie);
      }
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
