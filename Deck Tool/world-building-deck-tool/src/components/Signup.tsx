import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser, loginUser } from "../services/userServices";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading) return;

        setError(null);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const firstName = formData.get("first-name") as string;
        const email = formData.get("email") as string;
        const confirmPassword = formData.get("confirm-password") as string;

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            // 1. Create the account
            const signupRes = await signupUser({
                username,
                email,
                password,
                first_name: firstName,
            });

            if (!signupRes.ok) {
                const text = await signupRes.text();
                setError(text || `Signup failed (status ${signupRes.status}).`);
                return;
            }

            // 2. Auto-login with the same credentials. This bypasses the /login
            // route entirely, which means the pending-deck cleanup in Login
            // never runs, so the effect in LandingPage can create the deck.
            const loginRes = await loginUser({ username, password });
            login(loginRes.token);

            // 3. Navigate home. If there's a pending deck, LandingPage's effect
            // will override this and route to /deck-creator instead.
            navigate("/");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    const inputClass =
        "w-full border border-app-border bg-app-code text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-md px-3 py-3 text-base sm:text-sm transition-all shadow-sm";
    const labelClass =
        "text-xs font-semibold uppercase tracking-[0.1em] text-app-text/70 mb-1.5 block";

    return (
        <div className="min-h-screen bg-app-bg p-4 md:p-6 font-sans text-app-text flex justify-center">
            <div className="flex flex-col items-center justify-center flex-1 w-full max-w-lg text-center gap-8 py-20 px-4">

                <div className="space-y-3">
                    <p className="text-app-text/70 text-xs md:text-sm font-light tracking-widest uppercase">
                        Account /
                    </p>
                    <h1 className="!text-3xl md:!text-4xl font-serif text-app-heading !my-0">
                        Create your <span className="italic">account</span>
                    </h1>
                    <p className="text-app-text font-light text-base md:text-lg">
                        Start your world-building with a new account.
                    </p>
                </div>

                <form
                    onSubmit={handleSignup}
                    className="w-full flex flex-col gap-4 bg-app-bg p-6 md:p-8 rounded-2xl border border-app-border shadow-sm text-left"
                >
                    <div>
                        <label htmlFor="username" className={labelClass}>Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            placeholder="Enter username..."
                            className={inputClass}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="first-name" className={labelClass}>First Name</label>
                        <input
                            id="first-name"
                            name="first-name"
                            type="text"
                            autoComplete="given-name"
                            placeholder="Enter first name..."
                            className={inputClass}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className={labelClass}>Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="Enter email..."
                            className={inputClass}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-4 border-y border-app-border/40 py-4">
                        <div>
                            <label htmlFor="password" className={labelClass}>Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Enter password..."
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirm-password" className={labelClass}>Confirm Password</label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Confirm password..."
                                className={inputClass}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <p
                            role="alert"
                            className="text-sm font-light text-red-500 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2.5"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-md text-sm font-medium transition-all shadow-sm flex items-center justify-center min-h-[44px] bg-app-heading text-app-bg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                    >
                        {loading ? "Creating account..." : "Signup"}
                    </button>
                </form>

                <p className="text-sm font-light text-app-text/70">
                    Already have an account?{" "}
                    <a href="/login" className="text-app-accent font-medium hover:underline underline-offset-4 transition-all">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
}