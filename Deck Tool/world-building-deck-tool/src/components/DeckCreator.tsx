import { useEffect, useState } from "react";
import Deck from "../features/deck/Deck";
import Card from "./Card";
import type { CardType } from "../lib/types";
import { addDeck, getDecks, deleteAllDecks, addCard, removeCard } from "../services/deckServices";

export default function DeckCreator() {
    const [decks, setDecks] = useState<Array<Deck>>([]);
    const [currentDeck, setCurrentDeck] = useState<number>(0);
    const [idMap, setIdMap] = useState<Map<number, number>>(new Map());
    const [selectedRange, setSelectedRange] = useState<string>("number");
    const [rangeList, setRangeList] = useState<Array<string | number>>([""]);
    const [editMode, setEditMode] = useState<boolean>(false);
    console.log("decks: ", decks);
    console.log("currentDeck: ", currentDeck);
    const selectedOption = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        setSelectedRange(e.currentTarget.value);
    };

    const selectDeck = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        setCurrentDeck(idMap.get(Number(e.currentTarget.value)) ?? 0);
    };

    const fetchDecks = async () => {
        const userDecks = await getDecks();
        if(userDecks.length > 0) {
            setDecks(userDecks.map((deck: Deck) => Deck.fullCreate(deck)));
            setIdMap(new Map(userDecks.map((deck: Deck, index: number) => [deck.deckId, index])));
        }
        else {
            setDecks([]);
        }
    };

    useEffect(() => {
        fetchDecks();
    }, []);


    const clearDecks = () => {
        setDecks([]);
        deleteAllDecks();
    }


    const createCard = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const type = formData.get('type') as string;
        const range = selectedRange === 'number' ? formData.get('range-number') as any : rangeList;

        console.log(decks);
        await addCard(decks[currentDeck].deckId, type, range);
        await fetchDecks();

    }

    const createDeck = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const deckName = formData.get('deck-name') as string;

        console.log("deck name: ", deckName);
        await addDeck(deckName);
            // setDecks(prev => [...prev, new Deck(deckName, deckId)])
        fetchDecks();
}
    


    const handleRangeListChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        setRangeList(prev => {
            const newList = [...prev];
            newList[index] = e.target.value
            return newList;
        });
    }
    const removeCardHelper = async (deckIndex: number, cardIndex: number) => {
        if(editMode) {
            console.log(decks[deckIndex].deckList[cardIndex]);
            await removeCard(decks[deckIndex].deckId, decks[deckIndex].deckList[cardIndex].cardId);
            await fetchDecks();
        }
    }

    return (
        decks.length !== 0 ? <div className="flex flex-col justify-center items-center">
            <form onSubmit={createCard} className="flex flex-col justify-center items-center gap-3">
                <div className="flex flex-row gap-1">
                    <span>Type</span>
                    <input name="type" type="text" className="border"></input>
                </div>
                <div>
                    <select onChange={selectedOption}>
                        <option value="number">Single Number</option>
                        <option value="list">Range List</option>
                    </select>
                    {selectedRange === "number" ? <input name="range-number" type="number" className="border"></input> : null}
                    {selectedRange === "list" ? 
                    <div>
                        <ul className="flex flex-col gap-1 justify-center items-center">
                            {rangeList.map((_, index) => <li key={"range-list-"+index}><input name={`range-list-input-${index+1}`} value={rangeList[index]} className="border" onChange={(e) => handleRangeListChange(e, index)}></input></li>)}
                        </ul>
                        <button type="button" onClick={() => setRangeList(prev => [...prev, ""])} className="p-1 bg-black text-white hover:text-black hover:bg-gray-200 cursor-pointer">Add new item</button>
                    </div>
                    : null}
                </div>
                <button className="p-1 bg-black text-white hover:text-black hover:bg-gray-200 cursor-pointer">Add new card</button>
            </form>
            <div>
                <div key={'deck-' + decks[currentDeck].deckName}>
                    <h1>Deck: {decks[currentDeck].deckName}</h1>
                    <ol className="flex flex-row">
                        {decks[currentDeck].deckList.map((card, index) => <li key={decks[currentDeck].deckName+"-card-"+index} onClick={() => removeCardHelper(currentDeck, index)} style={{borderColor: editMode ? "#FF0000" : "#FFFFFF"}} className={editMode ? "hover:ring-4 ring-red-400" : ""}><Card type={card.type} range={card.range} /></li>)}
                    </ol>
                </div>
            </div>
            <div className="flex flex-col gap-2 w-50 justify-center items-center">
                <h1>Deck Selector</h1>
                <select onChange={selectDeck}>
                    {decks.map(deck => <option value={deck.deckId} key={'deck-option-' + deck.deckId}>{deck.deckName}</option>)}
                </select>
                <form onSubmit={createDeck}>
                    <input name="deck-name" type="text" placeholder="Deck name here..."></input>
                    <button className="p-1 bg-black text-white hover:text-black hover:bg-gray-200 cursor-pointer">Add new Deck</button>
                </form>
                <button onClick={() => setEditMode(prev => !prev)} className="p-1 text-white bg-black hover:text-black hover:bg-gray-200 cursor-pointer border-2" style={{borderColor: editMode ? "#00FF00" : "#000000"}}>Edit Mode</button>
             <button onClick={clearDecks} className="p-1 text-white bg-black hover:text-black hover:bg-gray-200 cursor-pointer border-2">Clear Decks</button>
            </div>
        </div> :
        <div>
            <h2>Start by creating a new deck!</h2>
            <form onSubmit={createDeck}>
                <input name="deck-name" type="text" placeholder="Deck name here..."></input>
                <button className="p-1 bg-black text-white hover:text-black hover:bg-gray-200 cursor-pointer">Add new Deck</button>
            </form>
        </div>
    )
}