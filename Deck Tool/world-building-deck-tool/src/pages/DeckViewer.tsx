import { useState, useEffect } from "react";
import Deck from "../features/deck/Deck";
import type { CardType, UnformattedDeck } from "../lib/types";
import { getDecks, randomizeDeck, nextCard } from "../services/deckServices";

export default function DeckViewer() {
    const [decks, setDecks] = useState<Array<Deck>>([]);
    const [currentDeck, setCurrentDeck] = useState<number>(0);
    const [currentDeckList, setCurrentDeckList] = useState<Array<[number, CardType]>>([]);
    const [topCard, setTopCard] = useState<CardType | undefined>(undefined);
    const [rolledRange, setRolledRange] = useState<string | number>("");
    const [showNotes, setShowNotes] = useState<boolean>(false);
    const [showNotesPanel, setShowNotesPanel] = useState<boolean>(true);
    const [isShuffling, setIsShuffling] = useState<boolean>(false);
    const [position, setPosition] = useState<number>(0);

    // Notes panel
    const [storyWorld, setStoryWorld] = useState<string>("");
    const [noteTitle, setNoteTitle] = useState<string>("");
    const [noteBody, setNoteBody] = useState<string>("");

    useEffect(() => {
        const fetchDecks = async () => {
            const userDecks = await getDecks();
            if (userDecks.length > 0) {
                setDecks(userDecks.map((deck: UnformattedDeck) => Deck.fullCreate(deck)));
            } else {
                setDecks([]);
            }
        };
        fetchDecks();
    }, []);

    useEffect(() => {
        setCurrentDeckList([...decks[currentDeck]?.deckList ?? []]);
    }, [currentDeck, decks]);

    useEffect(() => {
        if (!decks[currentDeck]) {
            setTopCard(undefined);
            return;
        }
        const card = decks[currentDeck].getCardById(decks[currentDeck].deckIndices[0]);
        setTopCard(card);
        if (card?.range && card.range.length > 0) {
            setRolledRange(card.range[Math.floor(Math.random() * card.range.length)]);
        } else {
            setRolledRange("");
        }
        setShowNotes(false);
    }, [currentDeck, decks, currentDeckList]);

    function shuffle() {
        if (isShuffling) return;
        setIsShuffling(true);
        randomizeDeck(decks[currentDeck].deckId);
        setTimeout(() => {
            fetchDecksRefresh();
            setPosition(0);
            setIsShuffling(false);
        }, 550);
    }

    function next() {
        nextCard(decks[currentDeck].deckId);
        fetchDecksRefresh();
        setPosition(prev => {
            const total = currentDeckList.length ?? 1;
            return (prev + 1) % total;
        });
    }

    async function fetchDecksRefresh() {
        const userDecks = await getDecks();
        if (userDecks.length > 0) {
            setDecks(userDecks.map((deck: UnformattedDeck) => Deck.fullCreate(deck)));
        }
    }

    const selectDeck = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        setCurrentDeck(Number(e.currentTarget.value));
        setPosition(0);
    };

    if (!topCard) {
        return (
            <div className="min-h-screen bg-app-bg p-4 md:p-6 font-sans text-app-text flex justify-center">
                <div className="flex flex-col items-center justify-center flex-1 w-full max-w-lg text-center gap-6 py-20 px-4">
                    <p className="text-app-text/70 text-xs font-light tracking-[0.3em] uppercase">Story Engine</p>
                    <h1 className="!text-4xl md:!text-5xl font-serif italic text-app-heading !my-0">Inspiration Deck</h1>
                    <p className="text-app-text font-light text-base md:text-lg">No decks available yet. Create one to start drawing inspiration.</p>
                </div>
            </div>
        );
    }

    const totalCards = currentDeckList.length ?? 0;

    return (
        <div className="min-h-screen bg-app-bg p-4 md:p-6 font-sans text-app-text flex justify-center">
            <style>{`
                @keyframes shuffleAnim {
                    0%   { transform: rotate(0deg) scale(1); }
                    25%  { transform: rotate(-3deg) scale(0.97); }
                    50%  { transform: rotate(3deg) scale(0.97); }
                    75%  { transform: rotate(-2deg) scale(0.98); }
                    100% { transform: rotate(0deg) scale(1); }
                }
                .shuffle-anim { animation: shuffleAnim 0.55s ease-in-out; }
            `}</style>

            <div className="w-full max-w-6xl flex flex-col gap-8 md:gap-10">

                {/* HEADER */}
                <header className="flex flex-col items-center gap-3 pt-6">
                    <p className="text-app-text/70 text-[11px] md:text-xs font-light tracking-[0.35em] uppercase">
                        Story Engine
                    </p>
                    <h1 className="!text-4xl md:!text-5xl font-serif italic text-app-heading !my-0 leading-none">
                        Inspiration Deck
                    </h1>
                </header>

                {/* DECK SELECTOR */}
                <div className="flex flex-col items-center gap-2">
                    <label htmlFor="deck-select" className="text-app-text/70 text-[11px] font-medium uppercase tracking-[0.15em]">
                        Deck
                    </label>
                    <select
                        id="deck-select"
                        onChange={selectDeck}
                        value={decks[currentDeck]?.deckId || ""}
                        className="border border-app-border bg-app-bg text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-lg px-4 py-2.5 text-base sm:text-sm transition-all shadow-sm cursor-pointer font-medium min-h-[44px] min-w-[220px] max-w-[320px] text-center"
                    >
                        {decks.map(deck => (
                            <option value={deck.deckId} key={'deck-option-' + deck.deckId}>{deck.deckName}</option>
                        ))}
                    </select>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex justify-center items-stretch w-full">
                    {/* CARD COLUMN */}
                    <div className={`w-full max-w-xl flex flex-col gap-6 transition-all duration-500 ease-in-out ${showNotesPanel ? "lg:mr-6" : "mr-0"}`}>
                        <div className={`flex-1 rounded-2xl border border-app-border bg-app-bg shadow-sm flex flex-col justify-between p-8 md:p-10 ${isShuffling ? "shuffle-anim" : ""}`}>

                            {/* TYPE */}
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-app-text/60 mb-2">Type</p>
                                <h2 className="text-3xl md:text-4xl font-serif text-app-heading font-normal leading-tight break-words">
                                    {topCard.type}
                                </h2>
                            </div>

                            {/* RANGE */}
                            <div className="mt-8">
                                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-app-text/60 mb-2">Range</p>
                                <p className="text-xl md:text-2xl font-sans text-app-text font-normal break-words">
                                    {String(rolledRange)}
                                </p>
                                {topCard.range && topCard.range.length > 1 && (
                                    <p className="text-xs text-app-text/60 font-light mt-1">1 of {topCard.range.length}</p>
                                )}
                            </div>

                            {/* NOTES (collapsible inline) */}
                            {topCard.notes && (
                                <div className="mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowNotes(prev => !prev)}
                                        className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.15em] text-app-text/60 hover:text-app-text transition-colors bg-transparent border-none p-0 cursor-pointer outline-none"
                                    >
                                        <svg
                                            className={`w-3 h-3 transition-transform duration-200 ${showNotes ? "rotate-90" : "rotate-0"}`}
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                            strokeLinecap="round" strokeLinejoin="round"
                                        >
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                        <span>Notes</span>
                                    </button>
                                    {showNotes && (
                                        <p className="mt-3 text-sm text-app-text/80 font-light leading-relaxed border-l-2 border-app-border pl-3 break-words whitespace-pre-wrap">
                                            {topCard.notes}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* COUNTER */}
                            <div className="flex justify-end pt-8">
                                <span className="text-xs text-app-text/60 font-light tracking-widest tabular-nums">
                                    {position + 1} / {totalCards}
                                </span>
                            </div>
                        </div>

                        {/* CONTROLS */}
                        <div className="flex justify-center gap-4">
                            <button
                                type="button"
                                onClick={shuffle}
                                aria-label="Shuffle deck"
                                disabled={isShuffling}
                                className="w-12 h-12 rounded-full border border-app-border bg-app-bg text-app-heading hover:bg-app-code transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="16 3 21 3 21 8" />
                                    <line x1="4" y1="20" x2="21" y2="3" />
                                    <polyline points="21 16 21 21 16 21" />
                                    <line x1="15" y1="15" x2="21" y2="21" />
                                    <line x1="4" y1="4" x2="9" y2="9" />
                                </svg>
                            </button>

                            <button
                                type="button"
                                onClick={next}
                                aria-label="Next card"
                                className="w-12 h-12 rounded-full bg-app-heading text-app-bg hover:opacity-90 transition-all shadow-sm flex items-center justify-center"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowNotesPanel(prev => !prev)}
                                aria-label={showNotesPanel ? "Hide notes panel" : "Show notes panel"}
                                aria-pressed={showNotesPanel}
                                className={`w-12 h-12 rounded-full transition-all shadow-sm flex items-center justify-center border ${
                                    showNotesPanel
                                        ? "bg-app-heading text-app-bg border-app-heading hover:opacity-90"
                                        : "border-app-border bg-app-bg text-app-heading hover:bg-app-code"
                                }`}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="8" y1="13" x2="16" y2="13" />
                                    <line x1="8" y1="17" x2="16" y2="17" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* NOTES COLUMN (animated open/close) */}
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showNotesPanel ? "w-full max-w-md opacity-100" : "w-0 max-w-0 opacity-0"}`}>
                        <aside className="h-full w-full rounded-2xl border border-app-border bg-app-bg p-6 md:p-8 shadow-sm flex flex-col">
                            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-app-text/60 mb-6">
                                Your Notes
                            </p>

                            <div className="flex flex-col gap-5 flex-1">
                                {/* STORY / WORLD */}
                                <div>
                                    <label htmlFor="story-world" className="text-[11px] font-medium uppercase tracking-[0.15em] text-app-text/60 mb-2 block">
                                        Story / World
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            id="story-world"
                                            value={storyWorld}
                                            onChange={(e) => setStoryWorld(e.target.value)}
                                            className="flex-1 border border-app-border bg-app-code text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-md px-3 py-2 text-sm transition-all shadow-sm cursor-pointer min-h-[40px]"
                                        >
                                            <option value="">— No story attached —</option>
                                        </select>
                                        <button
                                            type="button"
                                            aria-label="Create new story or world"
                                            className="w-10 h-10 rounded-md border border-app-border bg-app-bg text-app-heading hover:bg-app-code transition-all shadow-sm flex items-center justify-center flex-shrink-0"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="12" y1="5" x2="12" y2="19" />
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* TITLE */}
                                <div>
                                    <label htmlFor="note-title" className="text-[11px] font-medium uppercase tracking-[0.15em] text-app-text/60 mb-2 block">
                                        Title
                                    </label>
                                    <input
                                        id="note-title"
                                        type="text"
                                        value={noteTitle}
                                        onChange={(e) => setNoteTitle(e.target.value)}
                                        placeholder={`Idea from "${topCard.type}"...`}
                                        className="w-full border border-app-border bg-app-bg text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-md px-3 py-2 text-sm transition-all shadow-sm placeholder:text-app-text/40 placeholder:italic"
                                    />
                                </div>

                                {/* NOTES BODY (grows to fill) */}
                                <div className="flex-1 flex flex-col">
                                    <label htmlFor="note-body" className="text-[11px] font-medium uppercase tracking-[0.15em] text-app-text/60 mb-2 block">
                                        Notes
                                    </label>
                                    <textarea
                                        id="note-body"
                                        value={noteBody}
                                        onChange={(e) => setNoteBody(e.target.value)}
                                        placeholder="Write whatever this card sparked..."
                                        className="w-full flex-1 border border-app-border bg-app-code text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-md px-3 py-2.5 text-sm transition-all shadow-sm resize-none min-h-[120px] placeholder:text-app-text/40"
                                    />
                                </div>

                                <button
                                    type="button"
                                    disabled={!noteTitle && !noteBody}
                                    className="w-full py-2.5 px-4 rounded-md text-sm font-medium transition-all shadow-sm flex items-center justify-center min-h-[44px] bg-app-heading text-app-bg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Save Note
                                </button>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
}