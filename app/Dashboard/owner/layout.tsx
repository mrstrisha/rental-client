import type { ReactNode } from "react";
import { requireRole } from "@/lib/requireRole";

export default async function OwnerAreaLayout({ children }: { children: ReactNode }) {
  await requireRole(["owner"]);
  return <>{children}</>;
}
