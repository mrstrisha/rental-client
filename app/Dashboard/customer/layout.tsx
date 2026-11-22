import type { ReactNode } from "react";
import { requireRole } from "@/lib/requireRole";

export default async function CustomerAreaLayout({ children }: { children: ReactNode }) {
  await requireRole(["customer"]);
  return <>{children}</>;
}
