import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/utils/supabase'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// export async function middleware(request: NextRequest) {
//   try {
//     const { supabase, response } = createMiddlewareClient(request)

//     // Refresh session if expired
//     const { data: { session } } = await supabase.auth.getSession()

//     // Protect /home route
//     if (request.nextUrl.pathname.startsWith('/home')) {
//       if (!session) {
//         return NextResponse.redirect(new URL('/login', request.url))
//       }
//     }

//     // Redirect authenticated users from login page to home
//     if (request.nextUrl.pathname === '/login' && session) {
//       return NextResponse.redirect(new URL('/home', request.url))
//     }

//     return response
//   } catch (e) {
//     // If Supabase client could not be created, proceed normally
//     console.error('Middleware error:', e)
//     return NextResponse.next({
//       request: { headers: request.headers },
//     })
//   }
// }

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}