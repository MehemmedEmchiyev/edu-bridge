import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Note: Token checking is done client-side in the protected layout
// since tokens are stored in localStorage. This middleware is kept
// for potential future server-side authentication or other purposes.

export function middleware(request: NextRequest) {
  // Middleware can be extended for server-side auth checks
  // when using cookies or headers instead of localStorage
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
