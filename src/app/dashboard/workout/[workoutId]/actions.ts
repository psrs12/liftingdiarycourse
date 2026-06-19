"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, workouts, exercises, sets } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface SetInput {
  id?: number;
  reps: number | null;
  weight: string;
  rpe: string;
}

interface ExerciseInput {
  id?: number;
  name: string;
  sets: SetInput[];
}

interface UpdateWorkoutInput {
  workoutId: number;
  name: string;
  exercises: ExerciseInput[];
}

export async function updateWorkout(input: UpdateWorkoutInput): Promise<{ success: boolean; error?: string }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Not authenticated" };

  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .then((rows) => rows[0]);

  if (!user) return { success: false, error: "User not found" };

  const [workout] = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.id, input.workoutId), eq(workouts.userId, user.id)));

  if (!workout) throw new Error("Workout not found");

  const validExercises = input.exercises.filter(
    (e) => e.name.trim() && e.sets.length > 0
  );

  if (validExercises.length === 0) {
    return { success: false, error: "At least one exercise with sets is required" };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(workouts)
      .set({ name: input.name.trim() || null })
      .where(eq(workouts.id, workout.id));

    await tx.delete(exercises).where(eq(exercises.workoutId, workout.id));

    for (let i = 0; i < validExercises.length; i++) {
      const exerciseInput = validExercises[i];

      const [exercise] = await tx
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
        await tx.insert(sets).values(setValues);
      }
    }
  });

  return { success: true };
}
