from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import ValidationError
from pymongo.errors import DuplicateKeyError
from typing import Optional
from database import get_db
import re
import logging
from schemas import User, LoginData, SignUpData, UserBasicData, BaseUser, AdminStats

from config import API_VERSION
from security import authenticate_user, create_token, hash_password, requires_admin, get_current_user
from fastapi_pagination.ext.pymongo import apaginate
from fastapi_pagination import Page

TOKEN_EXPIRATION_TIME = 30

user_api_router = APIRouter(prefix=f"/api/{API_VERSION}")
logger = logging.getLogger(__name__)


# Login
@user_api_router.post("/users/login", status_code=status.HTTP_200_OK)
async def login(payload: LoginData):
    try:
        user = await authenticate_user(payload.username, payload.password)

        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid login credentials")

        expire_time = timedelta(minutes=TOKEN_EXPIRATION_TIME)
        token = create_token({"username": user["username"], "user_id": user["user_id"], "is_admin": user["is_admin"]},
                             expire_time)
        return {"token": token, "token_type": "Bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during login. Please try again later."
        )


# Create a user / Sign-up
@user_api_router.post("/users/signup", status_code=status.HTTP_201_CREATED)
async def create_user(payload: SignUpData, db=Depends(get_db)):
    try:
        potential_user = await db["users"].find_one({"username": payload.username})
        if potential_user is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A user with this username already exists")

        data = payload.model_dump()
        data["password"] = hash_password(data["password"])
        user = await db["users"].insert_one(data)
        return f"Successfully added a new user with id: {user.inserted_id}"
    except HTTPException:
        raise
    except DuplicateKeyError:
        logger.error("Signup error: DuplicateKeyError encountered on insert")
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A user with this ID already exists")
    except ValidationError as e:
        logger.error(f"Signup validation error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid user data provided.")
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while creating the account."
        )


# Get self
@user_api_router.get("/users/self", status_code=status.HTTP_200_OK, response_model=UserBasicData)
async def self(user=Depends(get_current_user), db=Depends(get_db)):
    try:
        user_data = await db["users"].find_one({"user_id": user.user_id})

        if not user_data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")

        return UserBasicData(
            username=user_data["username"],
            first_name=user_data["first_name"],
            email=user_data["email"],
            is_admin=user_data["is_admin"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get self profile error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while fetching your profile."
        )


# get stats (count of users, count of decks, count of cards)
@user_api_router.get("/users/stats", status_code=status.HTTP_200_OK, response_model=AdminStats)
async def get_stats(_=Depends(requires_admin), db=Depends(get_db)):
    try:
        user_count = await db["users"].count_documents({})
        avg_deck_count = await db["decks"].count_documents({}) / user_count if user_count > 0 else 0

        return {
            "users_count": user_count,
            "avg_decks": round(avg_deck_count, 2)
        }
    except Exception as e:
        logger.error(f"Admin stats error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while generating statistics."
        )


# Get users (paginated)
@user_api_router.get("/users", status_code=status.HTTP_200_OK, response_model=Page[BaseUser])
async def get_users(query: Optional[str] = Query(None, min_length=1, max_length=100), _=Depends(requires_admin),
                    db=Depends(get_db)):
    try:
        query_filter: dict = {}

        if query:
            rx = {"$regex": re.escape(query.strip()), "$options": "i"}
            query_filter = {"first_name": rx}

        return await apaginate(
            db["users"],
            query_filter=query_filter,
            filter_fields={"_id": 0, "password": 0}
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch paginated users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while fetching users. Please try again later."
        )


# Get a user
@user_api_router.get("/users/{user_id}", status_code=status.HTTP_200_OK, response_model=User)
async def get_user(user_id: int, _=Depends(requires_admin), db=Depends(get_db)):
    try:
        # Fixed typo: changed fine_one to find_one
        user = await db["users"].find_one({"user_id": user_id})

        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id: {user_id} was not found")

        return user
    except ValidationError as e:
        logger.error(f"Get user validation error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="Data parsing error when retrieving user.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error for ID {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while retrieving the user profile."
        )


# Delete a user
@user_api_router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, _=Depends(requires_admin), db=Depends(get_db)):
    try:
        await db["decks"].delete_many({"user_id": user_id})
        result = await db["users"].delete_one({"user_id": user_id})

        if result.deleted_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id: {user_id} was not found")

        return None  # 204 No Content typically doesn't return a body
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete user error for ID {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while attempting to delete the user."
        )