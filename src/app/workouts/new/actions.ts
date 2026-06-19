"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, workouts, exercises, sets } from "@/db/schema";
import { eq } from "drizzle-orm";

interface SetInput {
  reps: number | null;
  weight: string;
  rpe: string;
}

interface ExerciseInput {
  name: string;
  sets: SetInput[];
}

interface CreateWorkoutInput {
  name: string;
  exercises: ExerciseInput[];
}

export async function createWorkout(input: CreateWorkoutInput) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/");

  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .then((rows) => rows[0]);

  if (!user) redirect("/");

  const validExercises = input.exercises.filter(
    (e) => e.name.trim() && e.sets.length > 0
  );

  if (validExercises.length === 0) {
    throw new Error("At least one exercise with sets is required");
  }

  const [workout] = await db
    .insert(workouts)
    .values({
      userId: user.id,
      name: input.name.trim() || null,
      startedAt: new Date(),
      completedAt: new Date(),
    })
    .returning({ id: workouts.id });

  for (let i = 0; i < validExercises.length; i++) {
    const exerciseInput = validExercises[i];

    const [exercise] = await db
      .insert(exercises)
      .values({
        workoutId: workout.id,
        name: exerciseInput.name.trim(),
        order: i + 1,
      })
      .returning({ id: exercises.id });

    const setValues = exerciseInput.sets.map((s, j) => ({
      exerciseId: exercise.id,
      setNumber: j + 1,
      reps: s.reps,
      weight: s.weight || null,
      rpe: s.rpe || null,
    }));

    if (setValues.length > 0) {
      await db.insert(sets).values(setValues);
    }
  }

  redirect("/dashboard");
}
