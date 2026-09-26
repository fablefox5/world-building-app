class Card {
    type: string;
    range: Array<string> | number;
    cardId: number;

    constructor(type: string, range: Array<string> | number, cardId: number) {
        this.type = type;
        this.range = range;
        this.cardId = cardId;
    }

}