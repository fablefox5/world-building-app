import type { LucideIcon } from "lucide-react";
import { Crown, Globe, Sparkles, Scale } from "lucide-react";

export type ExampleCard = {
    type: string;
    range: string[];
    notes?: string;
};

export type ExampleDeck = {
    id: string;
    name: string;
    bg: string;
    Icon: LucideIcon;
    cards: ExampleCard[];
};

export const exampleDecks: ExampleDeck[] = [
    {
        id: "character",
        name: "Character Deck",
        bg: "#8FAECB",
        Icon: Crown,
        cards: [
            {
                type: "Create Character",
                range: ["Villager / Layperson", "Merchant", "Noble", "Soldier", "Scholar", "Wanderer"],
                notes: "What is their role in the story?\nWhat drives them forward?\nWhat do they fear losing most?\nWho do they trust, and why?",
            },
            {
                type: "Create Villain",
                range: ["Petty Thief", "Rival Noble", "Corrupt Official", "Dark Sorcerer", "Warlord"],
                notes: "What do they want that the hero also wants?\nWhat wound made them this way?\nDo they see themselves as the villain?",
            },
            { type: "Character Motivation", range: ["Revenge", "Love", "Duty", "Survival", "Ambition", "Redemption"] },
            { type: "Character Flaw", range: ["Pride", "Greed", "Cowardice", "Naivety", "Ruthlessness"] },
        ],
    },
    {
        id: "locations",
        name: "Locations Deck",
        bg: "#B3C77E",
        Icon: Globe,
        cards: [
            {
                type: "Create Society",
                range: ["Village / Small Settlement", "Town", "City", "Kingdom", "Empire"],
                notes: "Why is the village located here?\nWhat are the customs or traditions?\nHow do they get basic necessities?\nAre they part of a larger society?\nWhat does this village look like?",
            },
            {
                type: "Create Terrain",
                range: ["Forest", "Mountain", "Desert", "Coast", "Plains", "Swamp"],
                notes: "What lives here that shouldn't?\nWhat does the air smell like?\nWhat is the greatest danger?",
            },
            { type: "Weather", range: ["Clear", "Stormy", "Foggy", "Snowy", "Sweltering"] },
            {
                type: "Landmark",
                range: ["Ruined Tower", "Ancient Bridge", "Hidden Shrine", "Crater"],
                notes: "Who built it and why?\nWhat happened to those who made it?\nWhat secret does it still keep?",
            },
        ],
    },
    {
        id: "religions",
        name: "Religions Deck",
        bg: "#B98AC7",
        Icon: Sparkles,
        cards: [
            {
                type: "Create Religion",
                range: ["Folk Tradition", "Organized Faith", "Mystery Cult", "State Religion"],
                notes: "What do they worship?\nHow is worship practiced?\nWho leads the faith?\nWhat do they believe about death?",
            },
            {
                type: "Create Deity",
                range: ["Sky Father", "Earth Mother", "Trickster", "Sun God", "Moon Goddess"],
                notes: "What is their domain?\nWhat do they demand from followers?\nWhat is their greatest flaw?",
            },
            { type: "Religious Practice", range: ["Ritual", "Prayer", "Sacrifice", "Pilgrimage", "Meditation"] },
            { type: "Afterlife Belief", range: ["Reincarnation", "Heaven / Hell", "Ancestor Spirits", "Oblivion"] },
        ],
    },
    {
        id: "politics",
        name: "Politics Deck",
        bg: "#C98A8A",
        Icon: Scale,
        cards: [
            {
                type: "Create Government",
                range: ["City-State", "Monarchy", "Republic", "Theocracy", "Oligarchy"],
                notes: "How is power distributed?\nWho holds authority?\nWhat is the succession method?\nWhat are the major factions?",
            },
            {
                type: "Political Faction",
                range: ["Merchant Guild", "Noble House", "Religious Order", "Military Junta"],
                notes: "What do they want?\nWho opposes them?\nWhat leverage do they hold?",
            },
            { type: "Political Conflict", range: ["Succession Crisis", "Border Dispute", "Civil War", "Trade Embargo"] },
            { type: "Law & Punishment", range: ["Exile", "Fine", "Imprisonment", "Trial by Combat"] },
        ],
    },
];