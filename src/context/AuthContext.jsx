import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const USERS_STORAGE_KEY = "ecom-users";
const CURRENT_USER_STORAGE_KEY = "ecom-current-user";

const fallbackUsers = [
  { id: "demo-user", name: "Demo User", email: "demo@kiqbal.com", password: "demo123" },
];

const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY));
      return Array.isArray(saved) && saved.length ? saved : fallbackUsers;
    } catch {
      return fallbackUsers;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_USER_STORAGE_KEY));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
      return;
    }

    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  }, [currentUser]);

  const signUp = ({ name, email, password }) => {
    if (!name || !email || !password) {
      throw new Error("Please fill in all fields.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExists = users.some((user) => user.email.toLowerCase() === normalizedEmail);

    if (userExists) {
      throw new Error("An account with this email already exists.");
    }

    const newUser = {
      id: newId(),
      name: name.trim(),
      email: normalizedEmail,
      password,
    };

    setUsers((current) => [...current, newUser]);
    setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });
    return newUser;
  };

  const signIn = ({ email, password }) => {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.password === password,
    );

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    setCurrentUser({ id: user.id, name: user.name, email: user.email });
    return user;
  };

  // NEW: sign in (or auto-create account) from a Google profile.
  // Demo only: no server check. For real accounts verify the Google token on a backend.
  const signInWithGoogle = ({ name, email, picture }) => {
    if (!email) {
      throw new Error("Google did not return an email address.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = users.find((item) => item.email.toLowerCase() === normalizedEmail);

    if (!user) {
      user = { id: newId(), name: name || normalizedEmail.split("@")[0], email: normalizedEmail, provider: "google" };
      setUsers((current) => [...current, user]);
    }

    setCurrentUser({ id: user.id, name: user.name, email: user.email, picture });
    return user;
  };

  const signOut = () => setCurrentUser(null);

  const value = {
    currentUser,
    users,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}