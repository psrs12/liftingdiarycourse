import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { users, workouts, exercises, sets } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { EditWorkoutClient } from "./edit-workout-client";

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/");

  const { workoutId: workoutIdParam } = await params;
  const workoutId = parseInt(workoutIdParam, 10);
  if (isNaN(workoutId)) notFound();

  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .then((rows) => rows[0]);

  if (!user) redirect("/");

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, user.id)));

  if (!workout) notFound();

  const exerciseRows = await db
    .select()
    .from(exercises)
    .where(eq(exercises.workoutId, workout.id));

  const exerciseIds = exerciseRows.map((e) => e.id);

  const setRows =
    exerciseIds.length > 0
      ? await db.select().from(sets).where(inArray(sets.exerciseId, exerciseIds))
      : [];

  const workoutData = {
    id: workout.id,
    name: workout.name ?? "",
    exercises: exerciseRows
      .sort((a, b) => a.order - b.order)
      .map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets: setRows
          .filter((s) => s.exerciseId === exercise.id)
          .sort((a, b) => a.setNumber - b.setNumber)
          .map((s) => ({
            id: s.id,
            reps: s.reps?.toString() ?? "",
            weight: s.weight ?? "",
            rpe: s.rpe ?? "",
          })),
      })),
  };

  return <EditWorkoutClient workout={workoutData} />;
}
