import { useState, useEffect, useRef } from "react";
import Deck from "../features/deck/Deck";
import type { CardType } from "../lib/types";
import LogSubmissionModal from "./LogSubmissionModal";
import { getDecks } from "../services/deckServices";

export default function DeckViewer() {
    const [selectedRanges, setSelectedRanges] = useState<Array<number>>([]);
    const [showLogModal, setShowLogModal] = useState<boolean>(false);
    const [decks, setDecks] = useState<Array<Deck>>([]);
    const [currentDeck, setCurrentDeck] = useState<number>(0);
    const topCard = useRef<CardType>(null);
    
    
    useEffect(() => {
        // const localDecks = JSON.parse(localStorage.getItem('deckData') ?? '[]');

        const fetchDecks = async () => {
            const userDecks = await getDecks();
            console.log("userDecks: ", userDecks);
            if(userDecks.length > 0) {
                setDecks(userDecks.map((deck: Deck) => Deck.fullCreate(deck)));
            }
            else {
                setDecks([]);
            }
        };
        fetchDecks();

        // if(deck.current.deckData.length === 0) {
            //         deck.current.addCard({type: "Create Society", range: ["Single family", "Small settlement", "Large settlement", "Small community", "Town", "Large Town", "City", "Territory / Civilization", "Country"]});
            //         deck.current.addCard({type: "Create Terrain", range: 10});
            //         deck.current.addCard({type: "Weather", range: ["Small scale weather (city)", "Large scale weather (country)", "Multi-territorial weather", "Global weather", "Atmospheric weather", "Spacial (Space) weather"]});
            //         deck.current.addCard({type: "Create Character", range: ["Villager/Layperson", "Producer/Provider (of goods, services, etc)", "Holds seat of power (small)", "Head of village/town", "High status over large town/city", 
            //             "Small status over country/territory", "Large status over country/territory", "Large status in specific organization/religion", "Large status over Island/continent", "Large status globally/internationally"], notes: "By 'high status', I refer to either how well known they are, their political/religious power/wealth, or actual physical/magical power'"});
            // }
            // console.log("on start: ", deck.current);
            // const initialDeckIndices = deck.current.deckData.map((_, index) => index);
            // setDeckIndices(initialDeckIndices);
        }, []);
        
    useEffect(() => {
        console.log(decks[currentDeck]);
        if(decks[currentDeck]) {
            topCard.current = decks[currentDeck].getCardByIndex(decks[currentDeck].deckIndices[0]);

            setSelectedRanges(decks[currentDeck].deckIndices.map(element => 
                Math.floor((Math.random() * (decks[currentDeck].getCardByIndex(element).range.length-1)))));
        }
            
    }, [currentDeck, decks]);

    // useEffect(() => {
    //     console.log("changed deck");
    //     // Change locally saved data
    //     if (decks.length > 0) {
    //         localStorage.setItem('deckData', JSON.stringify(decks));
    //     }
    // }, [decks]);


    function shuffle() {
            const newDeckIndices = [...decks[currentDeck].deckIndices];

            for(let i = 0; i < decks[currentDeck].deckIndices.length; i++) {
                newDeckIndices[i] = decks[currentDeck].deckIndices[i];
            }

            console.log(newDeckIndices.length);
            for(let i = 0 ; i < newDeckIndices.length-2; i++) {
                const j = Math.floor((Math.random() * decks[currentDeck].deckIndices.length));
                const temp = newDeckIndices[i];
                newDeckIndices[i] = newDeckIndices[j];
                newDeckIndices[j] = temp;
            }
            
            
            setDecks(prev => {
                const newDecks = [...prev];
                newDecks[currentDeck].deckIndices = newDeckIndices;
                return newDecks;
            });
    }
     
    function next() {
        const newDeckIndices = [...decks[currentDeck].deckIndices];
        const top = newDeckIndices.shift();
        console.log(decks[currentDeck].deckIndices);
        console.log(newDeckIndices);
        newDeckIndices.push((top !== undefined) ? top : -1);

        setDecks(prev => {
                const newDecks = [...prev];
                newDecks[currentDeck].deckIndices = newDeckIndices;
                return newDecks;
            });
    }

    const selectDeck = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault;
        setCurrentDeck(Number(e.currentTarget.value));
    }

    return (
        topCard.current ?
            <div className="flex flex-col justify-center items-center gap-10">
                <h1>Top Card</h1>
                <div className="border-2 rounded-xl p-5 w-75 h-75 flex justify-center items-center">
                    <div className="bg-gray-500 p-2 rounded-xl w-50 flex flex-col justify-center">
                                <span className="text-lg text-white">{topCard.current.type}</span>
                                <span className="text-emerald-200 text-md">{topCard.current.range[Math.floor((Math.random() * (topCard.current.range.length-1)))]}</span>
                                {topCard.current.notes ? <span className="text-stone-300 text-sm">{topCard.current.notes}</span> : null}
                    </div>
                </div>
            {/* <ul className="flex flex-col gap-5 items-center">
                {deckIndices.map((element, index) => {
                    return (<li>
                    <div className="bg-gray-500 p-2 rounded-xl w-50 flex flex-col">
                        <span className="text-md text-white">{deck.current.getCardByIndex(element).type}</span>
                        <span className="text-emerald-200 text-sm">{deck.current.getCardByIndex(element).range[selectedRanges[index]]}</span>
                        { <ul className="flex flex-col gap-1">
                            {deck.current.getCardByIndex(element).range.map((element, rangeIdx) => 
                                {
                                    console.log('color: ' + selectedRanges[index] + " : " + index);
                                    return (
                                    <li style={{color: selectedRanges[index] === rangeIdx ? '#89f089' : '#FFFFFF'}}>
                                        {element}
                                    </li>
                                    )
                                }
                            )}
                        </ul> }
                    </div>
                </li>)
                }
                )}
            </ul> */}
                <div className="flex gap-10">
                    <button className="bg-black text-white p-1 rounded-xl hover:bg-gray-300 hover:text-black cursor-pointer" onClick={shuffle}>Shuffle</button>
                    <button className="bg-black text-white p-1 rounded-xl hover:bg-gray-300 hover:text-black cursor-pointer" onClick={next}>Next</button>
                </div>
                <select onChange={selectDeck}>
                    {decks.map(deck => <option value={deck.deckId} key={'deck-option-' + deck.deckId}>{deck.deckName}</option>)}
                </select>
                <button onClick={() => setShowLogModal(prev => !prev)}>Create a log</button>
                {showLogModal ? <div className="fixed top-1/2 left-1/2 transform -translate-1/2">
                    <LogSubmissionModal />
                </div> : null}
        </div> : null
    )
}