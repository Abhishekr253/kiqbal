import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, MotionConfig, motion, useAnimation } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Google sign-in needs a client id: put VITE_GOOGLE_CLIENT_ID=xxxx in your .env
const GOOGLE_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID;

let gisPromise;
const loadGoogle = () => {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  gisPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = resolve;
    s.onerror = () => {
      gisPromise = undefined;
      reject(new Error("Could not load Google sign-in."));
    };
    document.head.appendChild(s);
  });
  return gisPromise;
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const COPY = {
  signin: { title: "Welcome back", sub: "Sign in to see your cart and orders.", side: "Good to see you again.", sideSub: "Pick up right where you left off." },
  signup: { title: "Create account", sub: "Join KIQBAL in less than a minute.", side: "Join KIQBAL.", sideSub: "Save your cart, track orders, check out faster." },
};

const GoogleG = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

function Field({ icon: Icon, label, inputRef, right, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold">{label}</label>
      <div className="group relative">
        <Icon
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#15181a]/40 transition-colors group-focus-within:text-[#15181a]"
        />
        <input
          ref={inputRef}
          {...props}
          className="w-full rounded-xl border border-[#15181a]/15 bg-[#f6f6f6] py-3 pl-11 pr-11 text-sm outline-none transition focus:border-[#15181a] focus:bg-white focus:shadow-[0_0_0_4px_rgba(21,24,26,0.06)]"
        />
        {right}
      </div>
    </div>
  );
}

function Dialog({ onClose, initialMode }) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done
  const [googleBusy, setGoogleBusy] = useState(false);
  const [welcome, setWelcome] = useState("");

  const shake = useAnimation();
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const closeTimer = useRef(null);

  const busy = status === "loading" || googleBusy;

  // lock page scroll, Esc to close, preload Google script, clean timers
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    if (GOOGLE_ID) loadGoogle().catch(() => {});
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      clearTimeout(closeTimer.current);
    };
  }, [busy, onClose]);

  // focus first field when opened / mode changes
  useEffect(() => {
    const t = setTimeout(() => (mode === "signup" ? nameRef : emailRef).current?.focus(), 450);
    return () => clearTimeout(t);
  }, [mode]);

  const set = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const switchMode = (m) => {
    setMode(m);
    setError("");
  };

  const fail = (msg) => {
    setError(msg);
    shake.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } });
  };

  const finish = (name) => {
    setWelcome(name?.split(" ")[0] || "");
    setStatus("done");
    closeTimer.current = setTimeout(onClose, 1700);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;

    const email = form.email.trim();
    if (mode === "signup" && form.name.trim().length < 2) return fail("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Enter a valid email address.");
    if (!form.password) return fail("Please enter your password.");
    if (mode === "signup" && form.password.length < 6) return fail("Password must be at least 6 characters.");

    setStatus("loading");
    await wait(500); // short pause so the loading state is visible
    try {
      const user = mode === "signup" ? signUp({ ...form, email }) : signIn({ ...form, email });
      finish(user.name);
    } catch (err) {
      setStatus("idle");
      fail(err.message);
    }
  };

  const google = async () => {
    if (busy) return;
    setError("");
    if (!GOOGLE_ID) return fail("Google sign-in needs VITE_GOOGLE_CLIENT_ID in your .env file.");

    setGoogleBusy(true);
    try {
      await loadGoogle();
      const token = await new Promise((resolve, reject) => {
        const cancelled = () => reject(new Error("Google sign-in was cancelled."));
        window.google.accounts.oauth2
          .initTokenClient({
            client_id: GOOGLE_ID,
            scope: "openid email profile",
            callback: (r) => (r.error ? cancelled() : resolve(r.access_token)),
            error_callback: cancelled,
          })
          .requestAccessToken();
      });
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not read your Google profile.");
      const p = await res.json();
      const user = signInWithGoogle({ name: p.name, email: p.email, picture: p.picture });
      finish(user.name);
    } catch (err) {
      fail(err.message);
    } finally {
      setGoogleBusy(false);
    }
  };

  const copy = COPY[mode];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* backdrop: its own fade, no blur (blur lags behind a fading parent) */}
      <motion.div
        className="absolute inset-0 bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !busy && onClose()}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative z-10 grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white text-[#15181a] shadow-2xl md:grid-cols-[5fr_7fr]"
      >
        {/* Left: brand panel (desktop only) */}
        <div className="relative hidden min-h-[580px] overflow-hidden bg-[#15181a] p-10 text-white md:flex md:flex-col md:justify-between">
          <motion.div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: "url('/img.png')" }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 12, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
          <p className="relative text-xl font-black tracking-wide">KIQBAL</p>
          <div className="relative">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="text-4xl font-black leading-tight tracking-tight">{copy.side}</h3>
                <p className="mt-3 text-white/70">{copy.sideSub}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right: form */}
        <div className="relative p-6 sm:p-10">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#15181a] text-white transition-transform duration-300 hover:rotate-90 disabled:opacity-50"
          >
            <X size={17} />
          </button>

          <AnimatePresence mode="wait" initial={false}>
            {status === "done" ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-[460px] flex-col items-center justify-center text-center"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-[#15181a] text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.25, duration: 0.5 }}
                    />
                  </svg>
                </motion.span>
                <h3 className="mt-6 text-3xl font-black tracking-tight">
                  {mode === "signup" ? "Welcome aboard" : "Welcome back"}
                  {welcome && `, ${welcome}`}
                </h3>
                <p className="mt-2 text-[#15181a]/60">You're signed in.</p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Tabs with sliding pill */}
                <div className="relative mt-6 flex w-full max-w-xs rounded-full bg-[#f1f1f1] p-1 sm:mt-0">
                  {[
                    ["signin", "Sign In"],
                    ["signup", "Sign Up"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => switchMode(key)}
                      className={`relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors duration-300 ${
                        mode === key ? "text-white" : "text-[#15181a]/60"
                      }`}
                    >
                      {mode === key && (
                        <motion.span
                          layoutId="auth-pill"
                          className="absolute inset-0 -z-10 rounded-full bg-[#15181a]"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      {label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="mt-7"
                  >
                    <h2 id="auth-title" className="text-3xl font-black tracking-tight">
                      {copy.title}
                    </h2>
                    <p className="mt-1 text-[#15181a]/60">{copy.sub}</p>
                  </motion.div>
                </AnimatePresence>

                {/* Google */}
                <motion.button
                  type="button"
                  onClick={google}
                  disabled={busy}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-[#15181a]/20 bg-white py-3 text-sm font-bold shadow-sm transition-colors hover:bg-[#f6f6f6] disabled:opacity-60"
                >
                  {googleBusy ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#15181a]/20 border-t-[#15181a]" />
                  ) : (
                    <GoogleG />
                  )}
                  Continue with Google
                </motion.button>

                <div className="my-5 flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#15181a]/40">
                  <span className="h-px flex-1 bg-[#15181a]/15" />
                  or
                  <span className="h-px flex-1 bg-[#15181a]/15" />
                </div>

                <motion.form
                  onSubmit={submit}
                  noValidate
                  animate={shake}
                  className="space-y-4"
                >
                  <AnimatePresence initial={false}>
                    {mode === "signup" && (
                      <motion.div
                        key="name"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="-mx-1 overflow-hidden px-1"
                      >
                        <Field
                          icon={User}
                          label="Full name"
                          inputRef={nameRef}
                          type="text"
                          name="name"
                          autoComplete="name"
                          value={form.name}
                          onChange={set}
                          placeholder="Your name"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Field
                    icon={Mail}
                    label="Email"
                    inputRef={emailRef}
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={set}
                    placeholder="you@example.com"
                  />

                  <Field
                    icon={Lock}
                    label="Password"
                    type={showPw ? "text" : "password"}
                    name="password"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={form.password}
                    onChange={set}
                    placeholder="••••••••"
                    right={
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        aria-label={showPw ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#15181a]/50 transition-colors hover:text-[#15181a]"
                      >
                        {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    }
                  />

                  <AnimatePresence initial={false}>
                    {error && (
                      <motion.p
                        key={error}
                        role="alert"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden text-sm font-medium text-red-600"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={busy}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center justify-center rounded-full bg-[#15181a] py-3.5 text-sm font-bold text-white disabled:opacity-70"
                  >
                    {status === "loading" ? (
                      <span className="flex items-center gap-1.5" aria-label="Please wait">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="h-2 w-2 animate-bounce rounded-full bg-white"
                            style={{ animationDelay: `${i * 0.12}s` }}
                          />
                        ))}
                      </span>
                    ) : mode === "signin" ? (
                      "Sign In"
                    ) : (
                      "Create Account"
                    )}
                  </motion.button>
                </motion.form>

                <div className="mt-5 flex flex-col items-center gap-2 text-sm text-[#15181a]/60">
                  <p>
                    {mode === "signin" ? "New here? " : "Already have an account? "}
                    <button
                      type="button"
                      onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                      className="font-bold text-[#15181a] underline-offset-4 hover:underline"
                    >
                      {mode === "signin" ? "Create an account" : "Sign in"}
                    </button>
                  </p>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, email: "demo@kiqbal.com", password: "demo123" }));
                        setError("");
                      }}
                      className="underline-offset-4 hover:text-[#15181a] hover:underline"
                    >
                      Use demo account
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// Rendered in a portal so the navbar's transform can't trap the fixed overlay.
function AuthModal({ open, onClose, initialMode = "signin" }) {
  return createPortal(
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && <Dialog key="auth" onClose={onClose} initialMode={initialMode} />}
      </AnimatePresence>
    </MotionConfig>,
    document.body,
  );
}

export default AuthModal;