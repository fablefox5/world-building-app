import { useState, useEffect } from "react";
import { loginUser } from "../services/userServices";
import { useAuth } from "../context/AuthContext";
import { clearPendingDeck } from "../lib/pendingDeck";

export default function Login() {
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // An existing user chose to log in — cancel any pending deck so it isn't
    // auto-created after they sign in. They'll make new decks in the creator.
    useEffect(() => {
        clearPendingDeck();
    }, []);

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading) return;

        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        try {
            const response = await loginUser({ username, password });
            login(response.token);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid username or password.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-app-bg p-4 md:p-6 font-sans text-app-text flex justify-center">
            <div className="flex flex-col items-center justify-center flex-1 w-full max-w-lg text-center gap-8 py-20 px-4">
                <div className="space-y-3">
                    <p className="text-app-text/70 text-xs md:text-sm font-light tracking-widest uppercase">
                        Account /
                    </p>
                    <h1 className="!text-3xl md:!text-4xl font-serif text-app-heading !my-0">
                        Welcome <span className="italic">back</span>
                    </h1>
                    <p className="text-app-text font-light text-base md:text-lg">
                        Sign in to continue building your decks.
                    </p>
                </div>

                <form
                    onSubmit={handleLogin}
                    className="w-full flex flex-col gap-4 bg-app-bg p-6 md:p-8 rounded-2xl border border-app-border shadow-sm text-left"
                >
                    <div>
                        <label htmlFor="username" className="text-xs font-semibold uppercase tracking-[0.1em] text-app-text/70 mb-1.5 block">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            placeholder="Enter username..."
                            className="w-full border border-app-border bg-app-code text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-md px-3 py-3 text-base sm:text-sm transition-all shadow-sm"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.1em] text-app-text/70 mb-1.5 block">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Enter password..."
                            className="w-full border border-app-border bg-app-code text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-md px-3 py-3 text-base sm:text-sm transition-all shadow-sm"
                            required
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-sm font-light text-red-500 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2.5">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-md text-sm font-medium transition-all shadow-sm flex items-center justify-center min-h-[44px] bg-app-heading text-app-bg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>

                <p className="text-sm font-light text-app-text/70">
                    Don&apos;t have an account?{" "}
                    <a href="/signup" className="text-app-accent font-medium hover:underline underline-offset-4 transition-all">
                        Create one
                    </a>
                </p>
            </div>
        </div>
    );
}