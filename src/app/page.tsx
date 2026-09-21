import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";

export default async function Home() {
  // Ensure DB is seeded on first hit
  await readDb();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  redirect("/closer");
}
