import os
import psycopg2
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from datetime import datetime
from dateutil.relativedelta import relativedelta
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
DATABASE_URL = None
with open(env_path) as f:
    for line in f:
        if line.startswith('DATABASE_URL='):
            DATABASE_URL = line.strip().split('=', 1)[1]
            break

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()
cur.execute("""
    SELECT DATE_TRUNC('month', started_at) AS month, COUNT(*) AS workout_count
    FROM workouts
    WHERE started_at >= NOW() - INTERVAL '1 year'
    GROUP BY month
    ORDER BY month;
""")
rows = cur.fetchall()
cur.close()
conn.close()

data = {row[0].strftime("%Y-%m"): row[1] for row in rows}

now = datetime.now()
months = []
counts = []
for i in range(11, -1, -1):
    dt = now - relativedelta(months=i)
    key = dt.strftime("%Y-%m")
    label = dt.strftime("%b")
    months.append(label)
    counts.append(data.get(key, 0))

plt.style.use('dark_background')
fig, ax = plt.subplots(figsize=(10, 5))
ax.bar(months, counts, color='#4fc3f7')
ax.set_xlabel('Month')
ax.set_ylabel('Number of Workouts')
ax.set_title('Workouts Per Month (Past Year)')
ax.yaxis.get_major_locator().set_params(integer=True)
plt.tight_layout()
plt.savefig('workout_chart.png', dpi=150)
print("Chart saved to workout_chart.png")
