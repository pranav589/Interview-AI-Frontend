import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TheInfiniteLandingPage from "@/components/landing/infinite-landing";

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;


  if (accessToken) {
    redirect("/dashboard");
  }

  return <TheInfiniteLandingPage />;
}
