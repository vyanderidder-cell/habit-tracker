import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function lastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export default function HabitTracker({ session, bare = false }) {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]); // { habit_id, date }
  const [newHabit, setNewHabit] = useState("");
  const [loading, setLoading] = useState(true);

  const days = useMemo(() => lastNDays(7), []);
  const todayISO = toISODate(new Date());

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    const { data: habitsData } = await supabase
      .from("habits")
      .select("*")
      .order("created_at", { ascending: true });

    const { data: logsData } = await supabase
      .from("habit_logs")
      .select("habit_id, date")
      .gte("date", toISODate(days[0]));

    setHabits(habitsData || []);
    setLogs(logsData || []);
    setLoading(false);
  }

  function isDone(habitId, dateISO) {
    return logs.some((l) => l.habit_id === habitId && l.date === dateISO);
  }

  function streakFor(habitId) {
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      const dISO = toISODate(days[i]);
      if (isDone(habitId, dISO)) {
        streak += 1;
      } else if (dISO !== todayISO) {
        break;
      }
    }
    return streak;
  }

  async function toggleDay(habitId, dateISO) {
    const done = isDone(habitId, dateISO);

    // update local state immediately, then sync
    if (done) {
      setLogs((prev) =>
        prev.filter((l) => !(l.habit_id === habitId && l.date === dateISO))
      );
      await supabase
        .from("habit_logs")
        .delete()
        .eq("habit_id", habitId)
        .eq("date", dateISO);
    } else {
      setLogs((prev) => [...prev, { habit_id: habitId, date: dateISO }]);
      await supabase.from("habit_logs").insert({
        habit_id: habitId,
        user_id: session.user.id,
        date: dateISO,
      });
    }
  }

  async function addHabit(e) {
    e.preventDefault();
    const name = newHabit.trim();
    if (!name) return;

    const { data, error } = await supabase
      .from("habits")
      .insert({ name, user_id: session.user.id })
      .select()
      .single();

    if (!error && data) {
      setHabits((prev) => [...prev, data]);
      setNewHabit("");
    }
  }

  const content = (
    <>
      <div className="date-row">
        <span style={{ flex: 1 }} />
        {days.map((d) => (
          <span
            key={toISODate(d)}
            className={`day-cell ${toISODate(d) === todayISO ? "today" : ""}`}
          >
            {DAY_LABELS[(d.getDay() + 6) % 7]}
          </span>
        ))}
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : habits.length === 0 ? (
        <p className="empty-state">
          Pas encore d'habitude suivie. Ajoute la première ci-dessous — par
          exemple "Séance de sport" ou "Routine du soir".
        </p>
      ) : (
        habits.map((habit) => {
          const streak = streakFor(habit.id);
          return (
            <div className="habit-row" key={habit.id}>
              <div>
                <span className="habit-name">{habit.name}</span>
                {streak > 0 && (
                  <span className="habit-streak">{streak} j de suite</span>
                )}
              </div>
              {days.map((d) => {
                const dISO = toISODate(d);
                const future = d > new Date();
                return (
                  <button
                    key={dISO}
                    className={`check ${isDone(habit.id, dISO) ? "done" : ""}`}
                    disabled={future}
                    onClick={() => toggleDay(habit.id, dISO)}
                    aria-label={`${habit.name} - ${dISO}`}
                  />
                );
              })}
            </div>
          );
        })
      )}

      <form className="add-habit" onSubmit={addHabit}>
        <input
          type="text"
          placeholder="Nouvelle habitude (ex: Crème hydratante)"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
        />
        <button type="submit">Ajouter</button>
      </form>
    </>
  );

  if (bare) return content;

  return (
    <div className="app-shell">
      <div className="masthead">
        <h1>Carnet</h1>
        <button onClick={() => supabase.auth.signOut()}>Se déconnecter</button>
      </div>
      {content}
    </div>
  );
}
