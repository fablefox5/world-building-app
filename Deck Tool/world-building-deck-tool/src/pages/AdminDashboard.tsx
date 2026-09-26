import { useEffect, useState } from "react";
import { Users, Layers, Trash2, Search, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import DeletionModal from "../components/DeletionModal";
import { useAuth } from "../context/AuthContext";
import { getUsers, deleteUser, getStats } from "../services/adminServices";
import type { UserBasicParams, Stats, Page } from "../lib/types";

const PAGE_SIZE = 5;

function StatCard({ label, value, Icon }: { label: string; value: string | number; Icon: typeof Users }) {
    return (
        <div className="rounded-xl border border-app-border bg-app-bg p-5 shadow-sm flex items-center gap-4">
            <span className="w-10 h-10 rounded-full bg-app-accent/10 text-app-accent flex items-center justify-center flex-shrink-0">
                <Icon size={18} strokeWidth={2} />
            </span>
            <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.15em] text-app-text/60 font-medium">{label}</p>
                <p className="text-2xl font-serif text-app-heading tabular-nums">{value}</p>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const auth = useAuth();
    const [usersPage, setUsersPage] = useState<Page<UserBasicParams> | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<UserBasicParams | null>(null);
    const [refetchKey, setRefetchKey] = useState(0);

    // 1. Debounce the raw input into debouncedQuery
    useEffect(() => {
        const id = setTimeout(() => setDebouncedQuery(query.trim()), 300);
        return () => clearTimeout(id);
    }, [query]);

    // 2. Whenever the effective search term changes, go back to page 1
    useEffect(() => {
        setPage(1);
    }, [debouncedQuery]);

    // 3. Fetch on page / search / manual refetch
    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const [pageData, statsData] = await Promise.all([
                    getUsers(page, PAGE_SIZE, debouncedQuery),
                    getStats(),
                ]);
                if (!cancelled) {
                    setUsersPage(pageData);
                    setStats(statsData);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load data.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [page, debouncedQuery, refetchKey]);

    async function confirmDelete() {
        if (!pendingDelete) return;
        const target = pendingDelete;
        try {
            await deleteUser(target.userId);

            // If we just deleted the last remaining row on a non-first page,
            // step back one page (triggers a refetch via the effect).
            // Otherwise force a refetch in place.
            if (usersPage && usersPage.items.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                setRefetchKey(k => k + 1);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete user.");
        } finally {
            setPendingDelete(null);
        }
    }

     if (auth.loading) {
        return (
            <div className="min-h-screen bg-app-bg p-4 md:p-6 font-sans text-app-text flex justify-center">
                <div className="flex flex-col items-center justify-center flex-1 w-full max-w-lg text-center gap-4 py-20 px-4">
                    <span className="w-10 h-10 rounded-full border-2 border-app-border border-t-app-accent animate-spin" />
                    <p className="text-app-text/60 font-light text-sm">Checking your session…</p>
                </div>
            </div>
        );
    }

    if (!auth.user?.is_admin) {
        return (
            <div className="min-h-screen bg-app-bg p-4 md:p-6 font-sans text-app-text flex justify-center">
                <div className="flex flex-col items-center justify-center flex-1 w-full max-w-lg text-center gap-4 py-20 px-4">
                    <span className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                        <ShieldAlert size={22} strokeWidth={2} />
                    </span>
                    <h1 className="!text-2xl font-serif text-app-heading !my-0">Access denied</h1>
                    <p className="text-app-text/70 font-light text-sm">
                        You don't have permission to view this page.
                    </p>
                </div>
            </div>
        );
    }

    const items = usersPage?.items ?? [];
    const totalPages = usersPage?.pages ?? 0;

    return (
        <div className="min-h-screen bg-app-bg p-4 md:p-6 font-sans text-app-text flex justify-center">
            <div className="w-full max-w-5xl flex flex-col gap-8 py-6">

                <header className="flex flex-col gap-2">
                    <p className="text-app-text/70 text-[11px] md:text-xs font-light tracking-[0.35em] uppercase">
                        Admin
                    </p>
                    <h1 className="!text-3xl md:!text-4xl font-serif italic text-app-heading !my-0 leading-tight">
                        Dashboard
                    </h1>
                    <p className="text-app-text/70 font-light text-sm md:text-base">
                        Manage users and keep an eye on the world.
                    </p>
                </header>

                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StatCard label="Users" value={stats.usersCount} Icon={Users} />
                        <StatCard label="Avg Decks / User" value={stats.avgDecks} Icon={Layers} />
                    </div>
                )}

                {error && (
                    <p role="alert" className="text-sm font-light text-red-500 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2.5">
                        {error}
                    </p>
                )}

                <section className="rounded-xl border border-app-border bg-app-bg shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-app-border">
                        <h2 className="!text-base font-serif text-app-heading !my-0">Users</h2>
                        <div className="relative w-full sm:w-72">
                            <Search
                                size={14}
                                strokeWidth={2.5}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text/40 pointer-events-none"
                            />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search all users..."
                                className="w-full border border-app-border bg-app-code text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-md pl-9 pr-3 py-2 text-sm transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-sm text-app-text/60 font-light">
                            Loading users...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="p-8 text-center text-sm text-app-text/60 font-light">
                            {debouncedQuery ? "No users match your search." : "No users yet."}
                        </div>
                    ) : (
                        <ul className="divide-y divide-app-border/60">
                            {items.map(user => (
                                <li
                                    key={user.userId}
                                    className="flex items-center gap-4 p-4 md:px-5 hover:bg-app-code/40 transition-colors"
                                >
                                    <span className="w-9 h-9 rounded-full bg-app-accent/10 text-app-accent flex items-center justify-center text-sm font-medium flex-shrink-0 uppercase">
                                        {(user.first_name?.[0] ?? user.username[0] ?? "?").toUpperCase()}
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-app-heading truncate">
                                                {user.first_name || user.username}
                                            </p>
                                            {user.is_admin && (
                                                <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-app-accent bg-app-accent/10 px-1.5 py-0.5 rounded">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-app-text/60 font-light truncate">
                                            @{user.username}{user.email ? ` · ${user.email}` : ""}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setPendingDelete(user)}
                                        disabled={user.userId === auth.user?.userId}
                                        aria-label={`Delete ${user.username}`}
                                        title={user.userId === auth.user?.userId ? "You can't delete your own account" : "Delete user"}
                                        className="w-9 h-9 rounded-full border border-app-border bg-app-bg text-app-text hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all shadow-sm flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-app-bg disabled:hover:text-app-text disabled:hover:border-app-border"
                                    >
                                        <Trash2 size={14} strokeWidth={2} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {usersPage && totalPages > 1 && (
                        <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 border-t border-app-border">
                            <p className="text-xs text-app-text/60 font-light">
                                Page <span className="text-app-heading font-medium tabular-nums">{usersPage.page}</span> of{" "}
                                <span className="text-app-heading font-medium tabular-nums">{totalPages}</span>
                                <span className="hidden sm:inline"> · {usersPage.total} total</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page <= 1 || loading}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-app-border bg-app-bg text-app-text hover:bg-app-code disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={14} strokeWidth={2.5} />
                                    <span className="hidden sm:inline">Previous</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages || loading}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-app-border bg-app-bg text-app-text hover:bg-app-code disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <ChevronRight size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {pendingDelete && (
                <DeletionModal
                    onConfirm={confirmDelete}
                    onCancel={() => setPendingDelete(null)}
                    message={`Are you sure you want to delete "${pendingDelete.username}"? This will remove their account and all of their decks.`}
                />
            )}
        </div>
    );
}