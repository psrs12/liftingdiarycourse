"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Pencil, Plus } from "lucide-react";
import Link from "next/link";

interface SetData {
  id: number;
  exerciseId: number;
  setNumber: number;
  reps: number | null;
  weight: string | null;
  durationSeconds: number | null;
  rpe: string | null;
  createdAt: Date;
}

interface ExerciseData {
  id: number;
  workoutId: number;
  name: string;
  order: number;
  createdAt: Date;
}

interface WorkoutData {
  id: number;
  userId: number;
  name: string | null;
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null;
  createdAt: Date;
}

interface WorkoutWithExercises {
  workout: WorkoutData;
  exercises: Array<{
    exercise: ExerciseData;
    sets: SetData[];
  }>;
}

interface DashboardClientProps {
  date: string;
  workoutData: WorkoutWithExercises[];
}

export function DashboardClient({ date, workoutData }: DashboardClientProps) {
  const router = useRouter();
  const selectedDate = new Date(date + "T00:00:00");

  function onDateSelect(day: Date | undefined) {
    if (!day) return;
    const formatted = format(day, "yyyy-MM-dd");
    router.push(`/dashboard?date=${formatted}`);
  }

  return (
    <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-sans">Dashboard</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(selectedDate, "MMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button asChild className="w-full mb-6">
        <Link href="/workouts/new">
          <Plus className="h-4 w-4 mr-2" />
          New Workout
        </Link>
      </Button>

      {workoutData.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No workouts logged for this date.
        </p>
      ) : (
        <div className="space-y-4">
          {workoutData.map(({ workout, exercises }) => (
            <Card key={workout.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {workout.name ?? "Workout"}
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/workout/${workout.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                {workout.duration != null && (
                  <p className="text-sm text-muted-foreground">
                    {Math.floor(workout.duration / 60)}m {workout.duration % 60}s
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {exercises.map(({ exercise, sets }) => (
                  <div key={exercise.id}>
                    <h3 className="font-medium mb-2">{exercise.name}</h3>
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-3 py-2 text-left font-medium">Set</th>
                            <th className="px-3 py-2 text-left font-medium">Reps</th>
                            <th className="px-3 py-2 text-left font-medium">Weight</th>
                            {sets.some((s) => s.rpe) && (
                              <th className="px-3 py-2 text-left font-medium">RPE</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {sets.map((set) => (
                            <tr key={set.id} className="border-b last:border-0">
                              <td className="px-3 py-2">{set.setNumber}</td>
                              <td className="px-3 py-2">{set.reps ?? "—"}</td>
                              <td className="px-3 py-2">
                                {set.weight ? `${set.weight} kg` : "—"}
                              </td>
                              {sets.some((s) => s.rpe) && (
                                <td className="px-3 py-2">{set.rpe ?? "—"}</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
