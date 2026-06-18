import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, workouts, exercises, sets } from "@/db/schema";
import { eq, and, gte, lt, inArray } from "drizzle-orm";
import { DashboardClient } from "./dashboard-client";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/");

  const params = await searchParams;
  const dateStr = params.date ?? new Date().toISOString().split("T")[0];
  const dayStart = new Date(dateStr + "T00:00:00.000Z");
  const dayEnd = new Date(dateStr + "T00:00:00.000Z");
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .then((rows) => rows[0]);

  if (!user) redirect("/");

  const dayWorkouts = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, user.id),
        gte(workouts.startedAt, dayStart),
        lt(workouts.startedAt, dayEnd)
      )
    );

  const workoutIds = dayWorkouts.map((w) => w.id);

  if (workoutIds.length === 0) {
    return <DashboardClient date={dateStr} workoutData={[]} />;
  }

  const exerciseRows = await db
    .select()
    .from(exercises)
    .where(inArray(exercises.workoutId, workoutIds));

  const exerciseIds = exerciseRows.map((e) => e.id);

  const setRows =
    exerciseIds.length > 0
      ? await db.select().from(sets).where(inArray(sets.exerciseId, exerciseIds))
      : [];

  const workoutData = dayWorkouts.map((workout) => {
    const workoutExercises = exerciseRows
      .filter((e) => e.workoutId === workout.id)
      .sort((a, b) => a.order - b.order);

    return {
      workout,
      exercises: workoutExercises.map((exercise) => ({
        exercise,
        sets: setRows
          .filter((s) => s.exerciseId === exercise.id)
          .sort((a, b) => a.setNumber - b.setNumber),
      })),
    };
  });

  return <DashboardClient date={dateStr} workoutData={workoutData} />;
}
