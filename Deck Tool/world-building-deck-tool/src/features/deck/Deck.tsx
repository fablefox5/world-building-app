import type { CardType } from "../../lib/types";

export default class Deck {
    deckName: string;
    deckId: number;
    deckList: Array<CardType>;
    deckIndices: Array<number>;
    
    constructor(deckName: string, deckId: number) {
        this.deckList = new Array<CardType>(0);
        this.deckName = deckName;
        this.deckId = deckId;
        this.deckIndices = new Array<number>(0);
        
    }

    static fullCreate(params: {deckName: string, deckId: number, deckList: Array<CardType>, deckIndices: Array<number>}) {
        const newDeck = new Deck(params.deckName, params.deckId);
        newDeck.deckList = [...params.deckList];
        newDeck.deckIndices = [...params.deckIndices];
        
        return newDeck;
    }

    // addCard({type, range, notes}: {type: string, range: Array<string | number> | string | number, notes?: string}) {
    //     if(typeof range === "string" || typeof range === "number") {
    //         const iteratedArray: Array<number> = Array.from({length: Number(range)}, (_, index) => index+1);
    //         console.log("number: ", iteratedArray);
    //         this.deckList.push({type, range: iteratedArray, notes, cardId: });
    //     }
    //     else {
    //         this.deckList.push({type, range, notes});
    //     }
    //     console.log("adding card: " + type);
    //     console.log(this.deckIndices);
    //     console.log(this.deckIndices.length);
    //     this.deckIndices.push(this.deckIndices.length);
    // }

    deleteCard(index: number) {
        this.deckList.splice(index, 1);
        this.deckIndices = this.deckIndices.filter(value => value !== index)
    }

    getCardByIndex(index: number) {
        return this.deckList[index];
    }
    
}