import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateWorkoutClient } from "./create-workout-client";

export default async function NewWorkoutPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return <CreateWorkoutClient />;
}
