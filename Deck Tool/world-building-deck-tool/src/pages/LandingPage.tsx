import { useState, useRef, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from "lucide-react";
import DeckViewer from './DeckViewer';
import DeckCreator from './DeckCreator';
import Login from '../components/Login';
import Signup from '../components/Signup';
import MiniDeckViewer from '../components/MiniDeckViewer';
import { useAuth } from '../context/AuthContext';
import { addDeck } from "../services/deckServices";
import { exampleDecks, type ExampleDeck } from "../lib/exampleDecks";
import { savePendingDeck, consumePendingDeck, clearPendingDeck } from "../lib/pendingDeck";
import AdminDashboard from './AdminDashboard';

/* ---------- HOME (hero + carousel + flip overlay) ---------- */
function Home() {
    const auth = useAuth();
    const navigate = useNavigate();
    const [newDeckName, setNewDeckName] = useState("");
    const [focusedDeck, setFocusedDeck] = useState<ExampleDeck | null>(null);
    const [flipped, setFlipped] = useState(false);
    const [paused, setPaused] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const examplesRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!focusedDeck) return;
        setFlipped(false);
        const raf = requestAnimationFrame(() => setOverlayVisible(true));
        const timer = setTimeout(() => setFlipped(true), 450);
        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(timer);
        };
    }, [focusedDeck]);

    function scrollToExamples() {
        examplesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    async function handleCreateDeck(e: React.ChangeEvent<HTMLFormElement>) {
        e.preventDefault();
        const name = newDeckName.trim();
        if (!name) return;

        // Logged out — stash it and send them to signup (NOT login)
        if (!auth.user) {
            savePendingDeck(name);
            navigate("/signup");
            return;
        }

        // Logged in — create right now
        await addDeck(name);
        setNewDeckName("");
        navigate("/deck-creator");
    }

    function focusDeck(deck: ExampleDeck) {
        setFocusedDeck(deck);
        setPaused(true);
    }

    function closeFocus() {
        setOverlayVisible(false);
        setTimeout(() => {
            setFocusedDeck(null);
            setPaused(false);
            setFlipped(false);
        }, 320);
    }

    return (
        <>
            {/* HERO */}
            <section className="flex flex-col items-center text-center px-6 pt-16 md:pt-24 pb-24 gap-5">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-sans font-light text-app-heading tracking-tight max-w-4xl leading-tight">
                    Get Inspired. Start Creating. Keep Building.
                </h1>
                <p className="text-sm md:text-base text-app-text/70 font-light max-w-xl">
                    Create custom decks to draw inspiration and spark new ideas for all aspects of story-building.
                </p>

                <form
                    onSubmit={handleCreateDeck}
                    className="mt-14 md:mt-20 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md"
                >
                    <label htmlFor="new-deck" className="sr-only">New deck name</label>
                    <input
                        id="new-deck"
                        type="text"
                        value={newDeckName}
                        onChange={(e) => setNewDeckName(e.target.value)}
                        placeholder="New deck name..."
                        className="flex-1 border border-app-border bg-app-code text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-full px-5 py-3 text-sm transition-all shadow-sm"
                        required
                    />
                    <button
                        type="submit"
                        className="py-3 px-6 rounded-full text-sm font-medium transition-all shadow-sm flex items-center justify-center min-h-[44px] bg-app-accent text-white hover:opacity-90 whitespace-nowrap"
                    >
                        Create new deck
                    </button>
                </form>

                <button
                    type="button"
                    onClick={scrollToExamples}
                    className="mt-20 md:mt-28 px-6 py-2 rounded-full border border-app-accent/40 bg-app-bg text-app-accent hover:bg-app-accent/10 transition-all shadow-sm text-sm font-medium"
                >
                    View Examples
                </button>
            </section>

            {/* CAROUSEL */}
            <section ref={examplesRef} className="w-full py-20 md:py-28 overflow-hidden">
                <div className={`carousel-track flex ${paused ? "paused" : ""}`}>
                    {[...exampleDecks, ...exampleDecks].map((deck, i) => (
                        <button
                            key={deck.id + "-" + i}
                            onClick={() => focusDeck(deck)}
                            className="flex-shrink-0 w-72 h-96 mr-6 md:mr-8 rounded-3xl p-6 flex flex-col transition-transform duration-300 hover:scale-[1.02] text-left"
                            style={{ backgroundColor: deck.bg }}
                        >
                            <div className="flex items-center justify-between text-white">
                                <span className="font-semibold text-lg">{deck.name}</span>
                                <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
                                    <ChevronRight size={14} strokeWidth={2.5} />
                                </span>
                            </div>
                            <div className="flex-1 flex items-center justify-center text-black/30">
                                <deck.Icon size={140} strokeWidth={1.5} />
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* FOCUSED FLIP OVERLAY */}
            {focusedDeck && (
                <div
                    onClick={closeFocus}
                    className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${
                        overlayVisible ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <div
                        className={`flip-container transition-all duration-300 ease-out ${
                            overlayVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
                        }`}
                        onClick={(e) => { e.stopPropagation(); setFlipped(f => !f); }}
                    >
                        <div className={`flip-inner ${flipped ? "flipped" : ""}`}>
                            <div className="flip-face" style={{ backgroundColor: focusedDeck.bg }}>
                                <div className="w-full h-full p-6 flex flex-col">
                                    <div className="flex items-center justify-between text-white">
                                        <span className="font-semibold text-lg">{focusedDeck.name}</span>
                                        <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
                                            <ChevronRight size={14} strokeWidth={2.5} />
                                        </span>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center text-black/30">
                                        <focusedDeck.Icon size={180} strokeWidth={1.5} />
                                    </div>
                                </div>
                            </div>

                            <div className="flip-face flip-back" style={{ backgroundColor: focusedDeck.bg }}>
                                <MiniDeckViewer
                                    key={focusedDeck.id}
                                    deck={focusedDeck}
                                    onClose={closeFocus}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* ---------- LANDING PAGE (shell + routes) ---------- */
export default function LandingPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const prevUserRef = useRef(auth.user);

    // Auto-create the pending deck ONLY right after a signup completes.
    // The Login component clears the pending deck, so this effect only fires
    // for genuinely new users coming out of the signup flow.
    useEffect(() => {
        const justLoggedIn = !prevUserRef.current && auth.user;
        prevUserRef.current = auth.user;

        if (!justLoggedIn) return;

        const pending = consumePendingDeck();
        if (!pending) return;

        (async () => {
            try {
                await addDeck(pending);
                navigate("/deck-creator");
            } catch (err) {
                console.error("Failed to create pending deck:", err);
                savePendingDeck(pending);
            }
        })();
    }, [auth.user]);

    const navLink =
        "px-3 py-1.5 rounded-full text-sm font-medium text-app-heading transition-all duration-200 hover:bg-app-accent/10 hover:text-app-accent";

    return (
        <div className="min-h-screen bg-app-bg font-sans text-app-text">
            <style>{`
                @keyframes carouselScroll {
                    0%   { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
                .carousel-track {
                    animation: carouselScroll 60s linear infinite;
                    width: max-content;
                }
                .carousel-track.paused,
                .carousel-track:hover {
                    animation-play-state: paused;
                }

                .flip-container {
                    perspective: 1600px;
                    width: min(340px, 88vw);
                    height: min(480px, 78vh);
                }
                .flip-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transition: transform 0.9s cubic-bezier(0.4, 0, 0.2, 1);
                    transform-style: preserve-3d;
                }
                .flip-inner.flipped {
                    transform: rotateY(180deg);
                }
                .flip-face {
                    position: absolute;
                    inset: 0;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                    border-radius: 1.75rem;
                    overflow: hidden;
                    box-shadow: 0 20px 60px -20px rgba(0, 0, 0, 0.35);
                }
                .flip-back {
                    transform: rotateY(180deg);
                }

                @keyframes miniShuffle {
                    0%   { transform: translateX(0) rotate(0deg); }
                    25%  { transform: translateX(-8px) rotate(-1.5deg); }
                    50%  { transform: translateX(8px) rotate(1.5deg); }
                    75%  { transform: translateX(-4px) rotate(-0.75deg); }
                    100% { transform: translateX(0) rotate(0deg); }
                }
                .mini-shuffle {
                    animation: miniShuffle 0.45s ease-in-out;
                }
            `}</style>

            <header className="w-full flex items-center justify-between px-6 py-5 md:px-10 md:py-6">
                <Link to="/" className="font-serif text-xl md:text-2xl text-app-heading tracking-tight">
                    LoreBuildr
                </Link>
                <nav className="flex items-center gap-1 md:gap-2">
                    {auth.user ? (
                        <>
                            <Link to="/deck-tool" className={navLink}>Deck Tool</Link>
                            <Link to="/deck-creator" className={navLink}>Deck Creator</Link>
                            
                            {auth.user.is_admin && (
                                <Link to="/admin" className={navLink}>Admin Dashboard</Link>
                            )}
                            
                            <span className="hidden md:inline mx-2 text-sm font-light text-app-text/60">
                                Welcome, {auth.user.first_name}
                            </span>
                            <button
                                onClick={auth.logout}
                                className={navLink + " bg-transparent border-none cursor-pointer"}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={navLink}>Login</Link>
                            <Link
                                to="/signup"
                                className="ml-1 px-4 py-1.5 rounded-full text-sm font-medium bg-app-accent text-white transition-all duration-200 hover:opacity-90 shadow-sm"
                            >
                                Signup
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/deck-tool" element={<DeckViewer />} />
                <Route path="/deck-creator" element={<DeckCreator />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
        </div>
    );
}