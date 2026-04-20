import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LandingPage from "@/components/landing/landing-page";

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  console.log({accessToken})


  if (accessToken) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
