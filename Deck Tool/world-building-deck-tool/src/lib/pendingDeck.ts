const PENDING_DECK_KEY = "pendingDeckName";

export function savePendingDeck(name: string) {
    sessionStorage.setItem(PENDING_DECK_KEY, name);
}

export function consumePendingDeck(): string | null {
    const name = sessionStorage.getItem(PENDING_DECK_KEY);
    if (name) sessionStorage.removeItem(PENDING_DECK_KEY);
    return name;
}

export function clearPendingDeck() {
    sessionStorage.removeItem(PENDING_DECK_KEY);
}