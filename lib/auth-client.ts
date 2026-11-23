import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
      
    plugins: [inferAdditionalFields<typeof auth>(), jwtClient()],
  
   baseURL: process.env.NEXT_PUBLIC_API_URL,
  
  
});
 console.log("Better Auth API URL:", process.env.NEXT_PUBLIC_API_URL);