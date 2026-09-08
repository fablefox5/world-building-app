import type Deck from "../features/deck/Deck";
import { request } from "./apiConfig";


export async function getDecks(): Promise<Array<Deck>> {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("tokenType");
    if (!token || !tokenType) {
        throw new Error("No token found in local storage");
    }
    const response = await request("/decks", {
        method: "GET",
        headers: {
            "Authorization": `${tokenType} ${token}`,
            "Content-Type": "application/json",
        },
    }, "Get self request failed");
    return response.json();
}


export async function addDeck(name: string): Promise<number> {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("tokenType");
    if (!token || !tokenType) {
        throw new Error("No token found in local storage");
    }
    const response = await request("/decks", {
        method: "POST",
        headers: {
            "Authorization": `${tokenType} ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(
            {
                deckName: name,
                deckList: [],
                deckIndices: [],
            }
        )
    }, "Get self request failed");
    const data = await response.json();
    console.log("data:", data)
    return data;
}

export async function addCard(deckId: number, type: string, range: Array<string | number> | string | number, notes?: string): Promise<void> {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("tokenType");
    if (!token || !tokenType) {
        throw new Error("No token found in local storage");
    }

    // if range is a string or number, convert it to an array
    if (typeof range === "string" || typeof range === "number") {
        range = new Array(Number(range)).fill(0).map((_, index) => String(index));
    }

    const response = await request(`/decks/${deckId}/card`, {
        method: "POST",
        headers: {
            "Authorization": `${tokenType} ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            type,
            range,
            notes,
        }),
    }, "Add card request failed");
    if (!response.ok) {
        throw new Error("Failed to add card");
    }
}

export async function removeCard(deckId: number, cardId: number): Promise<void> {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("tokenType");
    if (!token || !tokenType) {
        throw new Error("No token found in local storage");
    }

    const response = await request(`/decks/${deckId}/card/${cardId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `${tokenType} ${token}`,
            "Content-Type": "application/json",
        },
    }, "Remove card request failed");
    if (!response.ok) {
        throw new Error("Failed to remove card");
    }
}

export async function deleteAllDecks(): Promise<void> {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("tokenType");
    if (!token || !tokenType) {
        throw new Error("No token found in local storage");
    }
    const response = await request("/decks", {
        method: "DELETE",
        headers: {
            "Authorization": `${tokenType} ${token}`,
            "Content-Type": "application/json",
        },
    }, "Delete all decks request failed");
    if (!response.ok) {
        throw new Error("Failed to delete all decks");
    }
}