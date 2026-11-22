import type { ReactNode } from "react";
import { requireRole } from "@/lib/requireRole";

export default async function AdminAreaLayout({ children }: { children: ReactNode }) {
  await requireRole(["admin"]);
  return <>{children}</>;
}
