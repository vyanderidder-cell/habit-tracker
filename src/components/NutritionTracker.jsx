import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { searchFood } from "../openFoodFacts";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function NutritionTracker({ session }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState(null); // food chosen, awaiting grams
  const [grams, setGrams] = useState(100);

  useEffect(() => {
    loadToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadToday() {
    setLoading(true);
    const { data } = await supabase
      .from("nutrition_logs")
      .select("*")
      .eq("date", todayISO())
      .order("created_at", { ascending: true });
    setEntries(data || []);
    setLoading(false);
  }

  async function runSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const found = await searchFood(query);
    setResults(found);
    setSearching(false);
  }

  function pickFood(food) {
    setPicked(food);
    setGrams(100);
    setResults([]);
    setQuery("");
  }

  async function addEntry() {
    if (!picked || !grams) return;
    const kcal = Math.round((picked.kcalPer100g * grams) / 100);

    const { data, error } = await supabase
      .from("nutrition_logs")
      .insert({
        user_id: session.user.id,
        date: todayISO(),
        food_name: picked.name,
        grams,
        kcal,
        off_code: picked.code,
      })
      .select()
      .single();

    if (!error && data) {
      setEntries((prev) => [...prev, data]);
      setPicked(null);
    }
  }

  async function removeEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await supabase.from("nutrition_logs").delete().eq("id", id);
  }

  const totalKcal = entries.reduce((sum, e) => sum + e.kcal, 0);

  if (loading) return <p style={{ padding: "1rem" }}>Chargement…</p>;

  return (
    <div>
      <p style={{ fontSize: "0.95rem", marginBottom: "1.25rem" }}>
        Aujourd'hui : <strong>{totalKcal} kcal</strong>
      </p>

      {entries.length === 0 ? (
        <p className="empty-state">Rien d'ajouté aujourd'hui. Cherche un aliment ci-dessous.</p>
      ) : (
        entries.map((e) => (
          <div
            className="habit-row"
            key={e.id}
            style={{ gridTemplateColumns: "1fr auto auto" }}
          >
            <span className="habit-name">{e.food_name}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>
              {e.grams} g · {e.kcal} kcal
            </span>
            <button
              onClick={() => removeEntry(e.id)}
              style={{
                background: "none",
                border: "none",
                color: "var(--coral)",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              retirer
            </button>
          </div>
        ))
      )}

      <form className="add-habit" onSubmit={runSearch} style={{ marginTop: "1.75rem" }}>
        <input
          type="text"
          placeholder="Chercher un aliment (ex: yaourt nature)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">{searching ? "…" : "Chercher"}</button>
      </form>

      {results.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          {results.map((r) => (
            <div
              key={r.code}
              className="habit-row"
              style={{ gridTemplateColumns: "1fr auto", cursor: "pointer" }}
              onClick={() => pickFood(r)}
            >
              <div>
                <span className="habit-name">{r.name}</span>
                {r.brand && (
                  <span className="habit-streak" style={{ color: "var(--ink-soft)" }}>
                    {r.brand}
                  </span>
                )}
              </div>
              <span style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>
                {r.kcalPer100g} kcal/100g
              </span>
            </div>
          ))}
        </div>
      )}

      {picked && (
        <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--line)", paddingTop: "1rem" }}>
          <p style={{ fontSize: "0.9rem", marginBottom: "0.6rem" }}>
            Quantité de <strong>{picked.name}</strong> :
          </p>
          <div className="add-habit" style={{ marginTop: 0 }}>
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value))}
              style={{ maxWidth: "5rem" }}
            />
            <span style={{ alignSelf: "center", color: "var(--ink-soft)", fontSize: "0.85rem" }}>
              grammes · {Math.round((picked.kcalPer100g * grams) / 100)} kcal
            </span>
            <button onClick={addEntry}>Ajouter</button>
          </div>
        </div>
      )}
    </div>
  );
}
