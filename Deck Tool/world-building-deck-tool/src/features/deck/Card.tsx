class Card {
    type: string;
    range: Array<string> | number;

    constructor(type: string, range: Array<string> | number) {
        this.type = type;
        this.range = range;
    }

}