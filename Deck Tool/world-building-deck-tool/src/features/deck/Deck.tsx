import type { CardType, UnformattedDeck } from "../../lib/types";

export default class Deck {
    deckName: string;
    deckId: number;
    deckList: Map<number, CardType>;
    deckIndices: Array<number>;
    
    constructor(deckName: string, deckId: number) {
        this.deckList = new Map<number, CardType>();
        this.deckName = deckName;
        this.deckId = deckId;
        this.deckIndices = new Array<number>(0); //TRACKED WITH IDS
    }

    static fullCreate(deck: UnformattedDeck) {
        const newDeck = new Deck(deck.deckName, deck.deckId);
        newDeck.deckList = new Map<number, CardType>(deck.deckList.map((card) => [card.cardId, card]));
        newDeck.deckIndices = [...deck.deckIndices];
        
        return newDeck;
    }

    deleteCard(id: number) {
        this.deckList.delete(id);
        this.deckIndices = this.deckIndices.filter(value => value !== id)
    }

    getCardById(id: number) {
        return this.deckList.get(id);
    }
    
}