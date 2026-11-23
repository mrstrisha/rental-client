import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";
import { jwtClient } from "better-auth/client/plugins";

// Better Auth is served by this Next.js app at /api/auth/*.
// Do not point the auth client at NEXT_PUBLIC_API_URL; that URL is only for
// the Express data API. With no explicit baseURL, Better Auth uses the
// relative /api/auth path on the current origin.


export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), jwtClient()],
});