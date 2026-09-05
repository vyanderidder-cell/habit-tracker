import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function WorkoutBuilder({ session }) {
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [sessionCounts, setSessionCounts] = useState({}); // workout_id -> count
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAll() {
    setLoading(true);
    const [{ data: workoutsData }, { data: exercisesData }, { data: sessionsData }] =
      await Promise.all([
        supabase
          .from("workouts")
          .select("*, workout_exercises(*, exercises(name, category))")
          .order("created_at", { ascending: true }),
        supabase.from("exercises").select("*").order("category"),
        supabase.from("workout_sessions").select("workout_id"),
      ]);

    setWorkouts(workoutsData || []);
    setExercises(exercisesData || []);

    const counts = {};
    (sessionsData || []).forEach((s) => {
      counts[s.workout_id] = (counts[s.workout_id] || 0) + 1;
    });
    setSessionCounts(counts);
    setLoading(false);
  }

  async function logSession(workoutId) {
    setSessionCounts((prev) => ({ ...prev, [workoutId]: (prev[workoutId] || 0) + 1 }));
    await supabase.from("workout_sessions").insert({
      workout_id: workoutId,
      user_id: session.user.id,
    });
  }

  if (loading) return <p style={{ padding: "1rem" }}>Chargement…</p>;

  if (building) {
    return (
      <BuildForm
        session={session}
        exercises={exercises}
        onCancel={() => setBuilding(false)}
        onCreated={(w) => {
          setWorkouts((prev) => [...prev, w]);
          setBuilding(false);
        }}
      />
    );
  }

  return (
    <div>
      {workouts.length === 0 ? (
        <p className="empty-state">
          Pas encore de séance créée. Monte la première avec les exercices du
          catalogue.
        </p>
      ) : (
        workouts.map((w) => (
          <div className="habit-row" key={w.id} style={{ gridTemplateColumns: "1fr auto" }}>
            <div>
              <span className="habit-name">{w.name}</span>
              <span className="habit-streak" style={{ color: "var(--ink-soft)" }}>
                {w.workout_exercises.length} exercice(s)
                {sessionCounts[w.id] ? ` · faite ${sessionCounts[w.id]}x` : ""}
              </span>
            </div>
            <button className="primary-button" onClick={() => logSession(w.id)}>
              J'ai fait cette séance
            </button>
          </div>
        ))
      )}

      <div style={{ marginTop: "1.75rem" }}>
        <button className="primary-button" onClick={() => setBuilding(true)}>
          + Créer une séance
        </button>
      </div>
    </div>
  );
}

function BuildForm({ session, exercises, onCancel, onCreated }) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]); // { exercise_id, sets, reps }
  const [saving, setSaving] = useState(false);

  const categories = [...new Set(exercises.map((e) => e.category))];

  function toggleExercise(ex) {
    setSelected((prev) => {
      const exists = prev.find((s) => s.exercise_id === ex.id);
      if (exists) return prev.filter((s) => s.exercise_id !== ex.id);
      return [...prev, { exercise_id: ex.id, name: ex.name, sets: 3, reps: 10 }];
    });
  }

  function updateField(exerciseId, field, value) {
    setSelected((prev) =>
      prev.map((s) =>
        s.exercise_id === exerciseId ? { ...s, [field]: Number(value) || 0 } : s
      )
    );
  }

  async function save() {
    if (!name.trim() || selected.length === 0) return;
    setSaving(true);

    const { data: workout, error } = await supabase
      .from("workouts")
      .insert({ name: name.trim(), user_id: session.user.id })
      .select()
      .single();

    if (error || !workout) {
      setSaving(false);
      return;
    }

    const rows = selected.map((s, i) => ({
      workout_id: workout.id,
      exercise_id: s.exercise_id,
      sets: s.sets,
      reps: s.reps,
      position: i,
    }));
    await supabase.from("workout_exercises").insert(rows);

    onCreated({
      ...workout,
      workout_exercises: rows.map((r) => ({
        ...r,
        exercises: { name: selected.find((s) => s.exercise_id === r.exercise_id).name },
      })),
    });
    setSaving(false);
  }

  return (
    <div>
      <div className="add-habit" style={{ marginTop: 0, marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Nom de la séance (ex: Push day)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: "1.25rem" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--ink-soft)", marginBottom: "0.4rem" }}>
            {cat}
          </p>
          {exercises
            .filter((e) => e.category === cat)
            .map((ex) => {
              const picked = selected.find((s) => s.exercise_id === ex.id);
              return (
                <div
                  key={ex.id}
                  className="habit-row"
                  style={{ gridTemplateColumns: "1fr auto auto auto", gap: "0.6rem" }}
                >
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="checkbox"
                      checked={!!picked}
                      onChange={() => toggleExercise(ex)}
                    />
                    {ex.name}
                  </label>
                  {picked && (
                    <>
                      <input
                        type="number"
                        value={picked.sets}
                        onChange={(e) => updateField(ex.id, "sets", e.target.value)}
                        style={{ width: "3rem" }}
                        aria-label="séries"
                      />
                      <span style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>séries</span>
                      <input
                        type="number"
                        value={picked.reps}
                        onChange={(e) => updateField(ex.id, "reps", e.target.value)}
                        style={{ width: "3rem" }}
                        aria-label="répétitions"
                      />
                    </>
                  )}
                </div>
              );
            })}
        </div>
      ))}

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
        <button className="primary-button" onClick={save} disabled={saving}>
          {saving ? "…" : "Enregistrer la séance"}
        </button>
        <button onClick={onCancel} style={{ background: "none", border: "none", color: "var(--ink-soft)", cursor: "pointer", textDecoration: "underline" }}>
          Annuler
        </button>
      </div>
    </div>
  );
}
