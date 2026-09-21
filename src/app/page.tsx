import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";

export default function Home() {
  // Ensure DB is seeded on first hit
  readDb();
  const user = getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  redirect("/closer");
}
