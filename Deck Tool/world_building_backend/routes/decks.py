from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from database import get_db
from schemas import Deck, Card, User

from config import API_VERSION
from security import requires_admin, get_current_user

deck_api_router = APIRouter(prefix=f"/api/{API_VERSION}")


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
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A deck with this ID already exists")
    except ValidationError as e:
        print(e.detail.loc[1] + " " + e.detail.msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Create a card for a deck already existing
@deck_api_router.post("/decks/{deck_id}/card", status_code=status.HTTP_201_CREATED)
async def add_card(deck_id: int, payload: Card, user=Depends(get_current_user), db=Depends(get_db)):
    try:
        deck = await db["decks"].find_one({"deck_id": deck_id, "user_id": user.user_id})

        if deck is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User does not have a deck with id: {deck_id}")

        indices_count = len(deck.get("deck_indices", []))
        card = payload.model_dump()
        card["card_id"] = deck_id + len(deck.get("deck_list", []))

        await db["decks"].update_one({"deck_id": deck_id}, {"$push": {"deck_list": card, "deck_indices": indices_count}})
    except HTTPException:
        raise
    except ValidationError as e:
        print(e.detail.loc[1] + " " + e.detail.msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Remove a card from a deck already existing
@deck_api_router.delete("/decks/{deck_id}/card/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_card(deck_id: int, card_id: int, user=Depends(get_current_user), db=Depends(get_db)):
    try:
        deck = await db["decks"].find_one({"deck_id": deck_id, "user_id": user.user_id})

        if deck is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User does not have a deck with id: {deck_id}")


        potential_card = await db["decks"].find_one({"deck_id": deck_id, "user_id": user.user_id, "deck_list.card_id": card_id})

        if potential_card is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"Deck does not have a card with id: {card_id}")

        await db["decks"].update_one({"deck_id": deck_id, "user_id": user.user_id}, {"$pull": {"deck_list": {"card_id": card_id}}})
    except HTTPException:
        raise
    except ValidationError as e:
        print(e.detail.loc[1] + " " + e.detail.msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Remove a deck
@deck_api_router.delete("/decks/{deck_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_deck(deck_id: int, user=Depends(get_current_user), db=Depends(get_db)):
    print("remove deck")
    try:
        deck = await db["decks"].find_one({"deck_id": deck_id, "user_id": user.user_id})

        if deck is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User does not have a deck with id: {deck_id}")

        await db["decks"].delete_one({"deck_id": deck_id, "user_id": user.user_id})
    except HTTPException:
        raise
    except ValidationError as e:
        print(e.detail.loc[1] + " " + e.detail.msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Get self decks
@deck_api_router.get("/decks", status_code=status.HTTP_200_OK, response_model=list[Deck])
async def get_user_decks(user=Depends(get_current_user), db=Depends(get_db)):
    try:
        decks = await db["decks"].find({"user_id": user.user_id}).to_list(length=100)
        return decks
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Delete all self decks
@deck_api_router.delete("/decks", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_decks(user=Depends(get_current_user), db=Depends(get_db)):
    try:
        await db["decks"].delete({"user_id": user.user_id})
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))





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
        print(e.detail.loc[1] + " " + e.detail.msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# # Add a new deck for a user
# @deck_api_router.post("/decks/{user_id}", status_code=status.HTTP_201_CREATED)
# async def create_deck(user_id: int, payload: Deck, _=Depends(requires_admin), db=Depends(get_db)):
#     try:
#         data = payload.model_dump()
#         data["user_id"] = user_id
#         deck = await db["decks"].insert_one(data)
#         return f"Successfully added a new deck with id: {deck.inserted_id}"
#     except DuplicateKeyError:
#         raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A deck with this ID already exists")
#     except ValidationError as e:
#         print(e.detail.loc[1] + " " + e.detail.msg)
#     except Exception as e:
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))