import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
      
    plugins: [inferAdditionalFields<typeof auth>(), jwtClient()],
  
  baseURL: "http://localhost:3000",
  
});