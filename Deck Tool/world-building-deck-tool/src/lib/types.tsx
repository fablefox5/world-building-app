import type Deck from "../features/deck/Deck"

type CardType = {
    type: string,
    range: Array<string | number>
    notes?: string,
    cardId: number,
    index?: number
    total?: number
}

type UnformattedDeck = Omit<Deck, 'deckList'> & {
    deckList: Array<CardType>;
}

type UserBasicParams = {
    username: string;
    email: string;
    first_name: string;
    is_admin: boolean;
    userId: number;
}

type AuthContextType = {
    isAuthenticated: boolean;
    user: UserBasicParams | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
}

type LoginResponse = {
    token: string;
    token_type: string;
}

type Stats = {
    usersCount: number;
    avgDecks: number;
}

type Page<T> = {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export type { UserBasicParams, AuthContextType, LoginResponse, CardType, UnformattedDeck, Stats, Page };