import { useEffect, useState } from "react";
import Deck from "../features/deck/Deck";
import Card from "../components/Card";
import DeletionModal from "../components/DeletionModal";
import { addDeck, getDecks, deleteAllDecks, addCard, removeCard } from "../services/deckServices";
import type { CardType, UnformattedDeck } from "../lib/types";

export default function DeckCreator() {
    const [decks, setDecks] = useState<Array<Deck>>([]);
    const [currentDeck, setCurrentDeck] = useState<number>(0);
    const [idMap, setIdMap] = useState<Map<number, number>>(new Map());
    const [selectedRange, setSelectedRange] = useState<string>("number");
    const [rangeList, setRangeList] = useState<Array<string | number>>([""]);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [showDeletionModal, setShowDeletionModal] = useState<boolean>(false);

    const [currentDeckList, setCurrentDeckList] = useState<Array<[number, CardType]>>([]);

    const selectedOption = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        setSelectedRange(e.currentTarget.value);
    };

    const selectDeck = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        const deckId = idMap.get(Number(e.currentTarget.value));
        setCurrentDeck(deckId ?? 0);
    };

    const fetchDecks = async () => {
        const userDecks = await getDecks();
        if(userDecks.length > 0) {
            setDecks(userDecks.map((deck: UnformattedDeck) => Deck.fullCreate(deck)));
            setIdMap(new Map(userDecks.map((deck: UnformattedDeck, index: number) => [deck.deckId, index])));
        } else {
            setDecks([]);
        }
    };

    useEffect(() => {
        fetchDecks();
    }, []);

    useEffect(() => {
        setCurrentDeckList([...decks[currentDeck]?.deckList ?? []]);
    }, [currentDeck, decks]);

    const cancelDeletion = () => setShowDeletionModal(false);
    const confirmDeletion = () => clearDecks();

    const clearDecks = () => {
        setDecks([]);
        deleteAllDecks();
        setShowDeletionModal(false);
    }

    const createCard = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const type = formData.get('type') as string;
        const notes = formData.get('notes') as string;
        const range = selectedRange === 'number' ? formData.get('range-number') as any : rangeList;

        await addCard(decks[currentDeck].deckId, type, range, notes);
        await fetchDecks();
    }

    const createDeck = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const deckName = formData.get('deck-name') as string;

        await addDeck(deckName);
        fetchDecks();
    }
    
    const handleRangeListChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        setRangeList(prev => {
            const newList = [...prev];
            newList[index] = e.target.value;
            return newList;
        });
    }

    const removeCardHelper = async (deckIndex: number, cardId: number) => {
        if(editMode) {
            await removeCard(decks[deckIndex].deckId, cardId);
            await fetchDecks();
        }
    }

    return (
        <div className="min-h-screen bg-app-bg p-4 md:p-6 font-sans text-app-text flex justify-center">
            {decks.length !== 0 ? (
                <div className="w-full max-w-[1600px] flex flex-col gap-6">
                    
                    {/* TOP BAR: DECK TITLE & SWITCHER */}
                    <header className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-app-border">
                        <h1 className="!text-3xl md:!text-4xl font-serif text-app-heading flex items-center gap-2 !my-0">
                            <span className="text-app-text/70 font-sans text-xs md:text-sm font-light tracking-widest uppercase">Deck /</span> 
                            <span className="italic">{decks[currentDeck]?.deckName}</span>
                        </h1>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <label htmlFor="deck-select" className="text-app-text/70 text-[11px] font-medium uppercase tracking-[0.15em] whitespace-nowrap">
                                Switch Deck:
                            </label>
                            <select 
                                id="deck-select"
                                onChange={selectDeck} 
                                value={decks[currentDeck]?.deckId || ""}
                                className="border border-app-border bg-app-bg text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-lg px-3 py-2 text-base sm:text-sm transition-all shadow-sm cursor-pointer font-medium w-full sm:w-auto min-h-[44px]"
                            >
                                {decks.map(deck => <option value={deck.deckId} key={'deck-option-' + deck.deckId}>{deck.deckName}</option>)}
                            </select>
                        </div>
                    </header>

                    {/* MAIN CONTENT AREA */}
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                        
                        {/* LEFT SIDEBAR */}
                        <div className="w-full lg:w-[320px] xl:w-[280px] flex-shrink-0 flex flex-col gap-5 lg:sticky lg:top-6">
                            
                            {/* ADD CARD FORM */}
                            <div className="rounded-xl border border-app-border bg-app-bg p-4 md:p-5 shadow-sm">
                                <h2 className="!text-base font-serif text-app-heading mb-4 border-b border-app-border/40 pb-3 !mt-0">Create Card</h2>
                                
                                <form onSubmit={createCard} className="flex flex-col gap-4">
                                    <div>
                                        <label htmlFor="card-type" className="text-xs font-semibold uppercase tracking-[0.1em] text-app-text/70 mb-1.5 block">Type</label>
                                        <input 
                                            id="card-type"
                                            name="type" 
                                            type="text" 
                                            className="w-full border border-app-border bg-app-code text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-md px-3 py-2 text-base sm:text-sm transition-all shadow-sm" 
                                            placeholder="e.g. Character" 
                                            required 
                                        />
                                    </div>

                                    <div className="flex flex-col gap-4 border-y border-app-border/40 py-4">
                                        <div>
                                            <label htmlFor="range-type" className="text-xs font-semibold uppercase tracking-[0.1em] text-app-text/70 mb-1.5 block">Range Type</label>
                                            <select 
                                                id="range-type"
                                                onChange={selectedOption} 
                                                className="w-full border border-app-border bg-app-code text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-md px-3 py-2 text-base sm:text-sm transition-all shadow-sm cursor-pointer"
                                            >
                                                <option value="number">Single Number</option>
                                                <option value="list">Range List</option>
                                            </select>
                                        </div>

                                        {selectedRange === "number" && (
                                            <div>
                                                <label htmlFor="range-number" className="text-xs font-semibold uppercase tracking-[0.1em] text-app-text/70 mb-1.5 block">Max Number</label>
                                                <input 
                                                    id="range-number"
                                                    name="range-number" 
                                                    type="number" 
                                                    className="w-full border border-app-border bg-app-code text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-md px-3 py-2 text-base sm:text-sm transition-all shadow-sm" 
                                                    placeholder="e.g. 5" 
                                                    required 
                                                />
                                            </div>
                                        )}

                                        {selectedRange === "list" && (
                                            <div className="flex flex-col gap-3 p-3 border border-app-border/40 rounded-lg bg-app-code">
                                                <label className="text-xs font-semibold uppercase tracking-[0.1em] text-app-text/70 block">List Items</label>
                                                <ul className="flex flex-col gap-2">
                                                    {rangeList.map((_, index) => (
                                                        <li key={"range-list-"+index}>
                                                            <input 
                                                                aria-label={`List item ${index + 1}`}
                                                                name={`range-list-input-${index+1}`} 
                                                                value={rangeList[index]} 
                                                                className="w-full border border-app-border bg-app-bg text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-md px-3 py-2 text-base sm:text-sm transition-all shadow-sm" 
                                                                onChange={(e) => handleRangeListChange(e, index)}
                                                                placeholder={`Item ${index + 1}`}
                                                            />
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="flex gap-2 pt-1">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setRangeList(prev => [...prev, ""])} 
                                                        className="text-sm font-bold uppercase tracking-[0.1em] px-3 py-2 rounded-md transition-all text-app-accent hover:bg-app-accent-bg hover:opacity-90"
                                                    >
                                                        + Add
                                                    </button>

                                                    {rangeList.length > 1 && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setRangeList(prev => prev.slice(0, -1))} 
                                                            className="text-sm font-bold uppercase tracking-[0.1em] px-3 py-2 rounded-md transition-all text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                        >
                                                            - Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="card-notes" className="text-xs font-semibold uppercase tracking-[0.1em] text-app-text/70 mb-1.5 block">Notes (Optional)</label>
                                        <textarea 
                                            id="card-notes"
                                            name="notes" 
                                            rows={2} 
                                            className="w-full border border-app-border bg-app-code text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-md px-3 py-2 text-base sm:text-sm transition-all shadow-sm resize-y min-h-[80px]" 
                                            placeholder="Add notes..." 
                                        />
                                    </div>

                                    <button className="w-full py-2.5 px-4 rounded-md text-sm font-medium transition-all shadow-sm flex items-center justify-center min-h-[44px] bg-app-heading text-app-bg hover:opacity-90 mt-2">
                                        Add Card
                                    </button>
                                </form>
                            </div>

                            {/* CREATE NEW DECK */}
                            <div className="rounded-xl border border-app-border bg-app-bg p-4 md:p-5 shadow-sm">
                                <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-app-text/70 mb-1.5 block !mt-0">New Deck</h2>
                                <form onSubmit={createDeck} className="flex flex-col sm:flex-row lg:flex-col gap-2.5">
                                    <label htmlFor="deck-name" className="sr-only">Deck Name</label>
                                    <input 
                                        id="deck-name"
                                        name="deck-name" 
                                        type="text" 
                                        placeholder="Deck name..." 
                                        className="w-full border border-app-border bg-app-code text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-md px-3 py-2 text-base sm:text-sm transition-all shadow-sm" 
                                        required 
                                    />
                                    <button className="px-4 py-2.5 rounded-md text-sm font-medium transition-colors bg-app-heading text-app-bg hover:opacity-90 sm:w-auto w-full min-h-[44px]">
                                        Create
                                    </button>
                                </form>
                            </div>

                            {/* EDIT / CLEAR CONTROLS */}
                            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                                <button 
                                    onClick={() => setEditMode(prev => !prev)} 
                                    className={`w-full py-2.5 px-4 rounded-md text-sm font-medium transition-all shadow-sm flex items-center justify-center min-h-[44px] ${
                                        editMode 
                                            ? "bg-red-500/10 text-red-500 border border-red-500/40" 
                                            : "bg-app-bg text-app-heading border border-app-border hover:bg-app-code"
                                    }`}
                                >
                                    {editMode ? "Done Editing" : "Delete Cards"}
                                </button>
                                <button 
                                    onClick={() => setShowDeletionModal(true)} 
                                    className="w-full py-2.5 px-4 rounded-md text-sm font-medium transition-all shadow-sm flex items-center justify-center min-h-[44px] bg-app-bg text-app-text border border-app-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
                                >
                                    Clear All Decks
                                </button>
                            </div>
                        </div>

                        {/* RIGHT MAIN AREA: CARDS GRID */}
                        <div className="flex-1 w-full min-w-0">
                            {currentDeckList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-app-border rounded-xl bg-app-code/40">
                                    <p className="text-base font-medium text-app-heading mb-1">This deck is empty</p>
                                    <p className="text-sm font-light text-app-text/70">Use the form on the left to add your first card.</p>
                                </div>
                            ) : (
                                <ol className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 list-none p-0 m-0">
                                    {currentDeckList.map(([id, component], index) => (
                                        <li 
                                            key={decks[currentDeck].deckName+"-card-"+id} 
                                            onClick={() => removeCardHelper(currentDeck, id)} 
                                            className={`transition-all duration-300 rounded-2xl w-full ${editMode ? "cursor-pointer hover:-translate-y-1 hover:shadow-xl ring-4 ring-red-500/80 ring-offset-4 ring-offset-app-bg" : ""}`}
                                        >
                                            <Card type={component.type} range={component.range} notes={component.notes} index={index} total={currentDeckList.length} cardId={id} />
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>

                    </div>
                </div>
            ) : (
                /* EMPTY STATE */
                <div className="flex flex-col items-center justify-center flex-1 w-full max-w-lg text-center gap-8 py-20 px-4">
                    <div className="space-y-3">
                        <h2 className="!text-3xl md:!text-4xl font-serif text-app-heading">Welcome to DeckCreator</h2>
                        <p className="text-app-text font-light text-base md:text-lg">Start your world-building by creating a new deck.</p>
                    </div>
                    
                    <form onSubmit={createDeck} className="w-full flex flex-col gap-4 bg-app-bg p-6 md:p-8 rounded-2xl border border-app-border shadow-sm">
                        <div>
                            <label htmlFor="first-deck-name" className="sr-only">Enter deck name</label>
                            <input 
                                id="first-deck-name"
                                name="deck-name" 
                                type="text" 
                                placeholder="Enter deck name..." 
                                className="w-full border border-app-border bg-app-code text-app-heading focus:ring-2 focus:ring-app-accent-border focus:border-app-accent outline-none rounded-md px-3 py-3 text-base sm:text-sm transition-all shadow-sm" 
                                required 
                            />
                        </div>
                        <button className="w-full py-3 px-4 rounded-md text-sm font-medium transition-all shadow-sm flex items-center justify-center min-h-[44px] bg-app-heading text-app-bg hover:opacity-90">
                            Create First Deck
                        </button>
                    </form>
                </div>
            )}

            {showDeletionModal && (
                <DeletionModal 
                    onConfirm={confirmDeletion} 
                    onCancel={cancelDeletion} 
                    message="Are you sure you want to delete all decks?" 
                />
            )}
        </div>
    )
}