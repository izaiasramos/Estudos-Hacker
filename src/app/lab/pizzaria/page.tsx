import { redirect } from "next/navigation";
import { PizzariaLabApp } from "@/components/pizzaria-lab-app";
import { activeLab } from "@/lib/lab-runtime";
import { getCurrentUser } from "@/lib/current-user";

export default async function PizzariaLabPage() {
  const user = await getCurrentUser();
  if (!user?.ethicsAcceptedAt) redirect("/entrar");
  const session = await activeLab(user.id);
  if (!session) redirect("/trilha/sql-injection/lab-ofensivo");
  return <PizzariaLabApp />;
}
