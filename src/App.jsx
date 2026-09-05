import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import HabitTracker from "./components/HabitTracker";
import WorkoutBuilder from "./components/WorkoutBuilder";
import NutritionTracker from "./components/NutritionTracker";

export default function App() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [tab, setTab] = useState("habits"); // "habits" | "workouts"

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (checkingSession) return null;

  if (!session) return <Auth />;

  return (
    <div className="app-shell">
      <div className="masthead">
        <h1>Carnet</h1>
        <button onClick={() => supabase.auth.signOut()}>Se déconnecter</button>
      </div>

      <div className="tab-row">
        <button
          className={tab === "habits" ? "tab active" : "tab"}
          onClick={() => setTab("habits")}
        >
          Habitudes
        </button>
        <button
          className={tab === "workouts" ? "tab active" : "tab"}
          onClick={() => setTab("workouts")}
        >
          Séances
        </button>
        <button
          className={tab === "nutrition" ? "tab active" : "tab"}
          onClick={() => setTab("nutrition")}
        >
          Nutrition
        </button>
      </div>

      {tab === "habits" && <HabitTracker session={session} bare />}
      {tab === "workouts" && <WorkoutBuilder session={session} />}
      {tab === "nutrition" && <NutritionTracker session={session} />}
    </div>
  );
}
