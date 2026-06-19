"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, X } from "lucide-react";
import { createWorkout } from "./actions";

interface SetForm {
  reps: string;
  weight: string;
  rpe: string;
}

interface ExerciseForm {
  name: string;
  sets: SetForm[];
}

function emptySet(): SetForm {
  return { reps: "", weight: "", rpe: "" };
}

function emptyExercise(): ExerciseForm {
  return { name: "", sets: [emptySet()] };
}

export function CreateWorkoutClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<ExerciseForm[]>([emptyExercise()]);
  const [error, setError] = useState<string | null>(null);

  function updateExercise(index: number, updates: Partial<ExerciseForm>) {
    setExercises((prev) =>
      prev.map((e, i) => (i === index ? { ...e, ...updates } : e))
    );
  }

  function updateSet(exerciseIndex: number, setIndex: number, updates: Partial<SetForm>) {
    setExercises((prev) =>
      prev.map((e, ei) =>
        ei === exerciseIndex
          ? {
              ...e,
              sets: e.sets.map((s, si) =>
                si === setIndex ? { ...s, ...updates } : s
              ),
            }
          : e
      )
    );
  }

  function addExercise() {
    setExercises((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function addSet(exerciseIndex: number) {
    setExercises((prev) =>
      prev.map((e, i) =>
        i === exerciseIndex ? { ...e, sets: [...e.sets, emptySet()] } : e
      )
    );
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setExercises((prev) =>
      prev.map((e, ei) =>
        ei === exerciseIndex
          ? { ...e, sets: e.sets.filter((_, si) => si !== setIndex) }
          : e
      )
    );
  }

  function handleSubmit() {
    setError(null);

    const validExercises = exercises.filter((e) => e.name.trim());
    if (validExercises.length === 0) {
      setError("Add at least one exercise with a name.");
      return;
    }

    startTransition(async () => {
      try {
        await createWorkout({
          name: workoutName,
          exercises: validExercises.map((e) => ({
            name: e.name,
            sets: e.sets
              .filter((s) => s.reps || s.weight)
              .map((s) => ({
                reps: s.reps ? parseInt(s.reps, 10) : null,
                weight: s.weight,
                rpe: s.rpe,
              })),
          })),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-sans">New Workout</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="workout-name">Workout Name (optional)</Label>
          <Input
            id="workout-name"
            placeholder="e.g. Push Day, Leg Day"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
          />
        </div>

        {exercises.map((exercise, ei) => (
          <Card key={ei}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Exercise {ei + 1}</CardTitle>
                {exercises.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(ei)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Input
                placeholder="Exercise name"
                value={exercise.name}
                onChange={(e) => updateExercise(ei, { name: e.target.value })}
              />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium w-16">Set</th>
                      <th className="px-3 py-2 text-left font-medium">Reps</th>
                      <th className="px-3 py-2 text-left font-medium">Weight</th>
                      <th className="px-3 py-2 text-left font-medium">RPE</th>
                      <th className="px-3 py-2 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set, si) => (
                      <tr key={si} className="border-b last:border-0">
                        <td className="px-3 py-2 text-muted-foreground">
                          {si + 1}
                        </td>
                        <td className="px-3 py-1">
                          <Input
                            type="number"
                            placeholder="0"
                            className="h-8"
                            value={set.reps}
                            onChange={(e) =>
                              updateSet(ei, si, { reps: e.target.value })
                            }
                          />
                        </td>
                        <td className="px-3 py-1">
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="kg"
                            className="h-8"
                            value={set.weight}
                            onChange={(e) =>
                              updateSet(ei, si, { weight: e.target.value })
                            }
                          />
                        </td>
                        <td className="px-3 py-1">
                          <Input
                            type="number"
                            step="0.5"
                            min="1"
                            max="10"
                            placeholder="—"
                            className="h-8"
                            value={set.rpe}
                            onChange={(e) =>
                              updateSet(ei, si, { rpe: e.target.value })
                            }
                          />
                        </td>
                        <td className="px-3 py-1">
                          {exercise.sets.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => removeSet(ei, si)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSet(ei)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Set
              </Button>
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" className="w-full" onClick={addExercise}>
          <Plus className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save Workout"}
        </Button>
      </div>
    </main>
  );
}
