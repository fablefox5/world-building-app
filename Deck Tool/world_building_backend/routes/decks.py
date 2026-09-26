import logging
from random import random
from math import floor

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError
from pymongo.errors import DuplicateKeyError

from database import get_db
from schemas import Deck, Card, User

from config import API_VERSION
from security import requires_admin, get_current_user

deck_api_router = APIRouter(prefix=f"/api/{API_VERSION}")
logger = logging.getLogger(__name__)

# Get self decks
@deck_api_router.get("/decks", status_code=status.HTTP_200_OK, response_model=list[Deck])
async def get_user_decks(user=Depends(get_current_user), db=Depends(get_db)):
    try:
        decks = await db["decks"].find({"user_id": user.user_id}).to_list(length=100)
        return decks
    except Exception as e:
        logger.error(f"Error fetching user decks for user {user.user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while retrieving your decks."
        )

# Delete all self decks
@deck_api_router.delete("/decks", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_decks(user=Depends(get_current_user), db=Depends(get_db)):
    try:
        # Fixed: changed db["decks"].delete to db["decks"].delete_many
        await db["decks"].delete_many({"user_id": user.user_id})
        return None
    except Exception as e:
        logger.error(f"Error deleting all decks for user {user.user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while attempting to delete your decks."
        )

# Add a new deck for a user
@deck_api_router.post("/decks", status_code=status.HTTP_201_CREATED)
async def create_deck(payload: Deck, user=Depends(get_current_user), db=Depends(get_db)):
    try:
        data = payload.model_dump()
        data["user_id"] = user.user_id
        new_deck = await db["decks"].insert_one(data)
        deck = await db["decks"].find_one({"_id": new_deck.inserted_id})
        return deck["deck_id"]
    except DuplicateKeyError:
        logger.error("Create deck error: DuplicateKeyError encountered")
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A deck with this ID already exists")
    except ValidationError as e:
        logger.error(f"Deck validation error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid deck data provided.")
    except Exception as e:
        logger.error(f"Error creating deck for user {user.user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while creating the deck."
        )

# Create a card for a deck already existing
@deck_api_router.post("/decks/{deck_id}/card", status_code=status.HTTP_201_CREATED)
async def add_card(deck_id: int, payload: Card, user=Depends(get_current_user), db=Depends(get_db)):
    try:
        deck = await db["decks"].find_one({"deck_id": deck_id, "user_id": user.user_id})

        if deck is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User does not have a deck with id: {deck_id}")

        card = payload.model_dump()
        card["card_id"] = deck_id + len(deck.get("deck_list", []))

        if len(deck["deck_list"]) == 0:
            await db["decks"].update_one({"deck_id": deck_id}, {"$set": {"current_card_id": card["card_id"]}})

        await db["decks"].update_one({"deck_id": deck_id}, {"$push": {"deck_list": card, "deck_indices": card["card_id"]}})
        return {"card_id": card["card_id"]}
    except HTTPException:
        raise
    except ValidationError as e:
        logger.error(f"Card validation error for deck {deck_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid card data provided.")
    except Exception as e:
        logger.error(f"Error adding card to deck {deck_id} for user {user.user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while adding the card."
        )

# Remove a card from a deck already existing
@deck_api_router.delete("/decks/{deck_id}/card/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_card(deck_id: int, card_id: int, user=Depends(get_current_user), db=Depends(get_db)):
    try:
        deck = await db["decks"].find_one({"deck_id": deck_id, "user_id": user.user_id})

        if deck is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User does not have a deck with id: {deck_id}")

        potential_card = await db["decks"].find_one({"deck_id": deck_id, "user_id": user.user_id, "deck_list.card_id": card_id})

        if potential_card is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Deck does not have a card with id: {card_id}")

        await db["decks"].update_one(
            {"deck_id": deck_id, "user_id": user.user_id},
            {"$pull": {"deck_list": {"card_id": card_id}, "deck_indices": card_id}}
        )
        return None
    except HTTPException:
        raise
    except ValidationError as e:
        logger.error(f"Validation error while removing card {card_id} from deck {deck_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid card or deck ID format.")
    except Exception as e:
        logger.error(f"Error removing card {card_id} from deck {deck_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while attempting to remove the card."
        )

@deck_api_router.patch("/decks/{deck_id}/randomize", status_code=status.HTTP_200_OK)
async def randomize_indices(deck_id: int, user=Depends(get_current_user), db=Depends(get_db)):
    try:
        deck = await db["decks"].find_one({"deck_id": deck_id, "user_id": user.user_id})

        if deck is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User does not have a deck with id: {deck_id}")

        indices_count = len(deck["deck_indices"])
        deck_indices = deck["deck_indices"]
        for i in range(indices_count-2):
            j = floor(random() * indices_count)
            temp = deck_indices[i]
            deck_indices[i] = deck_indices[j]
            deck_indices[j] = temp

        await db["decks"].update_one(
            {"deck_id": deck_id, "user_id": user.user_id},
            {"$set": {"deck_indices": deck_indices}}
        )
        return {"message": "Deck shuffled successfully"}
    except HTTPException:
        raise
    except ValidationError as e:
        logger.error(f"Validation error shuffling deck {deck_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid data configuration.")
    except Exception as e:
        logger.error(f"Error randomizing deck {deck_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while shuffling the deck."
        )

@deck_api_router.patch("/decks/{deck_id}/next", status_code=status.HTTP_200_OK)
async def next_card(deck_id: int, user=Depends(get_current_user), db=Depends(get_db)):
    try:
        deck = await db["decks"].find_one({"deck_id": deck_id, "user_id": user.user_id})

        if deck is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User does not have a deck with id: {deck_id}")

        indices_count = len(deck["deck_indices"])
        deck_indices = deck["deck_indices"]

        if indices_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Deck with id: {deck_id} has no cards")

        old_top_card = deck_indices.pop(0)
        deck_indices.append(old_top_card)

        await db["decks"].update_one(
            {"deck_id": deck_id, "user_id": user.user_id},
            {"$set": {"deck_indices": deck_indices}}
        )
        return {"message": "Advanced to next card"}
    except HTTPException:
        raise
    except ValidationError as e:
        logger.error(f"Validation error advancing deck {deck_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid data configuration.")
    except Exception as e:
        logger.error(f"Error advancing card in deck {deck_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while advancing to the next card."
        )


# Remove a deck
@deck_api_router.delete("/decks/{deck_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_deck(deck_id: int, user=Depends(get_current_user), db=Depends(get_db)):
    try:
        deck = await db["decks"].find_one({"deck_id": deck_id, "user_id": user.user_id})

        if deck is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User does not have a deck with id: {deck_id}")

        await db["decks"].delete_one({"deck_id": deck_id, "user_id": user.user_id})
        return None
    except HTTPException:
        raise
    except ValidationError as e:
        logger.error(f"Validation error removing deck {deck_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid deck ID format.")
    except Exception as e:
        logger.error(f"Error deleting deck {deck_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while attempting to delete the deck."
        )


# ADMIN ROUTES

# Get all decks for specific user
@deck_api_router.get("/decks/{user_id}", status_code=status.HTTP_200_OK, response_model=list[Deck])
async def get_decks(user_id: int, _=Depends(requires_admin), db=Depends(get_db)):
    try:
        decks = await db["decks"].find({"user_id": user_id}).to_list(20)

        if len(decks) <= 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Could not find any decks from user: {user_id}")

        return decks
    except HTTPException:
        raise
    except ValidationError as e:
        logger.error(f"Validation error fetching decks for user {user_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid user ID format.")
    except Exception as e:
        logger.error(f"Error fetching decks for user {user_id} (Admin): {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while retrieving user decks."
        )