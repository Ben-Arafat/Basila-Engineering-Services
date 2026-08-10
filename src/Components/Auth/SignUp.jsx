import { useState } from "react";
import { getAuthInstance, getDbInstance } from "../../Firebase/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const Signup = ({ goToLogin, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const handleSignup = async (e) => {
  e.preventDefault();
  setError("");

if (!email || !password) {
  setError("Please enter both email and password.");
  return;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  setError("Please enter a valid email address.");
  return;
}

if (password.length < 6) {
  setError("Password must be at least 6 characters.");
  return;
}

  try {
    setLoading(true);

    const auth = await getAuthInstance();

    const {
      createUserWithEmailAndPassword,
    } = await import("firebase/auth");

    // Create the account ONCE
    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user = userCredential.user;

    // Create the customer's Firestore profile
    const db = await getDbInstance();

    await setDoc(
      doc(db, "customers", user.uid),
      {
        uid: user.uid,
        email: user.email,
        createdAt: serverTimestamp(),
      }
    );

    alert("Account created 🎉");

    onClose?.();

} catch (error) {
  console.error("Signup Error:", error);

  if (error.code === "auth/email-already-in-use") {
    setError("An account already exists with this email.");
  } else if (error.code === "auth/invalid-email") {
    setError("Please enter a valid email address.");
  } else if (error.code === "auth/weak-password") {
    setError("Password is too weak. Please choose a stronger password.");
  } else {
    setError("Signup failed. Please try again.");
  }

} finally {
  setLoading(false);
}
};

  return (
    <div>
      <h2 className="text-3xl font-bold text-center">Create Account</h2>

      <form onSubmit={handleSignup} className="mt-6 space-y-4">
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-xl px-4 py-3"
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-xl px-4 py-3"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 text-white py-3 rounded-xl disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => goToLogin?.()}
        className="mt-5 text-yellow-600"
      >
        Already have account? Login
      </button>
    </div>
  );
};

export default Signup;
