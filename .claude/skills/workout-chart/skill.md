---
name: workout-chart
description: Query the database for all workout entries from the past year and generate a bar chart (PNG) showing workouts per month. Use when the user asks to visualize, chart, or plot their workout history/frequency.
---

# Workout Chart Skill

Generate a bar chart of workout frequency by month for the past year.

## Steps

1. Read the `DATABASE_URL` from the `.env` file in the project root.

2. Write and execute a Python script that:
   - Connects to the PostgreSQL database using `psycopg2` (install if needed via `pip install psycopg2-binary matplotlib`)
   - Queries all workouts from the past 12 months:
     ```sql
     SELECT DATE_TRUNC('month', started_at) AS month, COUNT(*) AS workout_count
     FROM workouts
     WHERE started_at >= NOW() - INTERVAL '1 year'
     GROUP BY month
     ORDER BY month;
     ```
   - Uses `matplotlib` to create a bar chart:
     - X-axis: month labels (e.g. "Jan", "Feb", ...)
     - Y-axis: number of workouts
     - Title: "Workouts Per Month (Past Year)"
     - Style: dark background (`plt.style.use('dark_background')`)
   - Saves the chart as `workout_chart.png` in the project root directory

3. Show the user the path to the generated image.

## Important

- Always read DATABASE_URL from the `.env` file — do not hardcode credentials.
- Use `psycopg2-binary` for the database connection.
- Fill in months with zero workouts so all 12 months appear on the chart.
- Format month labels as abbreviated month names (Jan, Feb, Mar, etc.).
