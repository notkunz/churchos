import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/register", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // skip supabase entirely for public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config: { matcher: string[] } = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/reset-password", "/"],
};
