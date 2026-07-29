import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";

function PlannerMark() {
  return (
    <div className="auth-brand-mark" aria-hidden="true">
      <svg viewBox="0 0 48 48" role="img" aria-label="Study Planner Logo">
        <rect
          x="6"
          y="8"
          width="36"
          height="32"
          rx="8"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M16 18h16M16 24h10M16 30h8"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user ?? null);
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setMessage("Account created. You can sign in now.");
        setMode("login");
        setPassword("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (error) {
      setMessage(error.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  if (loading) {
    return <div className="auth-loading">Loading...</div>;
  }

  if (!user) {
    const isSignup = mode === "signup";

    return (
      <div className="auth-layout">
        <section className="auth-hero">
          <div className="auth-hero-inner">
            <PlannerMark />

            <div className="auth-kicker">Study Planner</div>

            <h1 className="auth-hero-title">
              Plan your week.
              <br />
              Keep it synced.
            </h1>

            <p className="auth-hero-copy">
              Organize tasks, events and daily routines in one clean planner and
              pick up exactly where you left off on any device.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <span className="auth-feature-dot" />
                <span>Task backlog and weekly planning</span>
              </div>
              <div className="auth-feature">
                <span className="auth-feature-dot" />
                <span>Calendar events and daily tasks</span>
              </div>
              <div className="auth-feature">
                <span className="auth-feature-dot" />
                <span>Secure sync with your own account</span>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-panel-wrap">
          <div className="auth-card">
            <div className="auth-card-head">
              <div>
                <p className="auth-eyebrow">
                  {isSignup ? "Create account" : "Welcome back"}
                </p>
                <h2>{isSignup ? "Start syncing your planner" : "Sign in"}</h2>
              </div>

              <PlannerMark />
            </div>

            <p className="auth-copy">
              {isSignup
                ? "Create your account to keep your planner available across laptop, tablet and PC."
                : "Sign in to access your saved tasks, events and daily routines."}
            </p>

            <form className="form-grid auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  minLength={8}
                  required
                />
              </label>

              {message && (
                <p
                  className={
                    message.toLowerCase().includes("created")
                      ? "auth-message success"
                      : "auth-message error"
                  }
                >
                  {message}
                </p>
              )}

              <button type="submit" disabled={submitting}>
                {submitting
                  ? "Please wait..."
                  : isSignup
                  ? "Create account"
                  : "Sign in"}
              </button>
            </form>

            <div className="auth-footer">
              <span>
                {isSignup ? "Already have an account?" : "No account yet?"}
              </span>

              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  setMode((prev) => (prev === "login" ? "signup" : "login"));
                  setMessage("");
                  setPassword("");
                }}
              >
                {isSignup ? "Sign in instead" : "Create one"}
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="auth-topbar">
        <span>{user.email}</span>
        <button type="button" onClick={handleLogout}>
          Sign out
        </button>
      </div>
      {children}
    </>
  );
}