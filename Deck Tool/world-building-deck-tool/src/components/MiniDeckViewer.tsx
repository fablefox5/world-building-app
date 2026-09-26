import { useState, useEffect } from "react";
import { X, Shuffle, ArrowRight, ChevronRight } from "lucide-react";
import type { ExampleCard, ExampleDeck } from "../lib/exampleDecks";

type MiniDeckViewerProps = {
    deck: ExampleDeck;
    onClose: () => void;
};

function pickRange(card: ExampleCard): string {
    if (!card?.range?.length) return "";
    return card.range[Math.floor(Math.random() * card.range.length)];
}

export default function MiniDeckViewer({ deck, onClose }: MiniDeckViewerProps) {
    const [cardIndex, setCardIndex] = useState(0);
    const [rolledRange, setRolledRange] = useState("");
    const [showNotes, setShowNotes] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);

    const card = deck.cards[cardIndex];

    // Re-roll the range whenever the top card changes
    useEffect(() => {
        setRolledRange(pickRange(deck.cards[cardIndex]));
        setShowNotes(false);
    }, [cardIndex, deck.id]);

    function shuffle() {
        if (isShuffling) return;
        setIsShuffling(true);
        setTimeout(() => {
            const newIndex = Math.floor(Math.random() * deck.cards.length);
            setCardIndex(newIndex);
            setRolledRange(pickRange(deck.cards[newIndex]));
            setShowNotes(false);
            setIsShuffling(false);
        }, 450);
    }

    function next() {
        setCardIndex(prev => (prev + 1) % deck.cards.length);
    }

    return (
        <div className="w-full h-full p-6 flex flex-col text-black/75">
            {/* TOP ROW */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-black/40 tabular-nums">
                    {cardIndex + 1} / {deck.cards.length}
                </span>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    aria-label="Close"
                    className="w-7 h-7 rounded-full bg-white/30 hover:bg-white/50 text-black/70 flex items-center justify-center transition-colors"
                >
                    <X size={14} strokeWidth={2.5} />
                </button>
            </div>

            {/* CARD CONTENT — anchored at top, so notes reveal below without shifting anything above */}
            <div className={`flex-1 flex flex-col gap-5 pt-6 ${isShuffling ? "mini-shuffle" : ""}`}>
                <div>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-black/40 font-medium mb-1.5">
                        Type
                    </p>
                    <p className="text-xl font-semibold leading-tight">{card.type}</p>
                </div>
                <div>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-black/40 font-medium mb-1.5">
                        Range
                    </p>
                    <p className="text-base">{rolledRange}</p>
                    {card.range.length > 1 && (
                        <p className="text-xs text-black/40 mt-0.5">1 of {card.range.length}</p>
                    )}
                </div>

                {/* NOTES (collapsible, flows downward only) */}
                {card.notes && (
                    <div>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setShowNotes(prev => !prev); }}
                            className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-black/40 hover:text-black/70 transition-colors bg-transparent border-none p-0 cursor-pointer outline-none font-medium"
                        >
                            <ChevronRight
                                size={12}
                                strokeWidth={2.5}
                                className={`transition-transform duration-200 ${showNotes ? "rotate-90" : "rotate-0"}`}
                            />
                            <span>Notes</span>
                        </button>
                        <div
                            className={`grid transition-all duration-300 ease-out ${
                                showNotes ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 mt-0"
                            }`}
                        >
                            <div className="overflow-hidden">
                                <p className="text-xs text-black/70 font-light leading-relaxed border-l-2 border-black/20 pl-3 whitespace-pre-line">
                                    {card.notes}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CONTROLS */}
            <div className="flex justify-center gap-3 pt-2">
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); shuffle(); }}
                    disabled={isShuffling}
                    aria-label="Shuffle deck"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm bg-white/30 text-black/70 hover:bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Shuffle size={16} strokeWidth={2} />
                </button>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    aria-label="Next card"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm bg-white text-black hover:bg-white/90"
                >
                    <ArrowRight size={16} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}