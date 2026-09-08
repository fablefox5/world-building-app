from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError
from pymongo.errors import DuplicateKeyError

from database import get_db
from schemas import Deck, Card, User, LoginData, TokenData, SignUpData, UserBasicData

from config import API_VERSION
from security import authenticate_user, create_token, hash_password, requires_admin, get_current_user

TOKEN_EXPIRATION_TIME = 30

user_api_router = APIRouter(prefix=f"/api/{API_VERSION}")

# Login
@user_api_router.post("/users/login", status_code=status.HTTP_200_OK)
async def login(payload: LoginData):
    try:
        user = await authenticate_user(payload.username, payload.password)

        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid login credentials")

        expire_time = timedelta(minutes=TOKEN_EXPIRATION_TIME)
        token = create_token({"username": user["username"], "user_id": user["user_id"], "is_admin": user["is_admin"]},expire_time)
        return {"token": token, "token_type": "Bearer"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Create a user / Sign-up
@user_api_router.post("/users/signup", status_code=status.HTTP_201_CREATED)
async def create_user(payload: SignUpData, db=Depends(get_db)):
    try:
        data = payload.model_dump()
        data["password"] = hash_password(data["password"])
        user = await db["users"].insert_one(data)
        return f"Successfully added a new user with id: {user.inserted_id}"
    except DuplicateKeyError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A user with this ID already exists")
    except ValidationError as e:
        print(e.detail.loc[1] + " " + e.detail.msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Get self
@user_api_router.get("/users/self", status_code=status.HTTP_200_OK, response_model=UserBasicData)
async def self(user=Depends(get_current_user), db=Depends(get_db)):
    user_data = await db["users"].find_one({"user_id": user.user_id})
    return UserBasicData(
        username=user_data["username"],
        first_name=user_data["first_name"],
        email=user_data["email"],
        is_admin=user_data["is_admin"]
    )


# Get a user
@user_api_router.get("/users/{user_id}", status_code=status.HTTP_200_OK, response_model=User)
async def get_user(user_id: int, _=Depends(requires_admin), db=Depends(get_db)):
    try:
        user = await db["users"].fine_one({"user_id": user_id})

        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id: {user_id} was not found")

        return user
    except DuplicateKeyError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A user with this ID already exists")
    except ValidationError as e:
        print(e.detail.loc[1] + " " + e.detail.msg)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Get all users
@user_api_router.get("/users", status_code=status.HTTP_200_OK, response_model=list[User])
async def get_users(_=Depends(requires_admin), db=Depends(get_db)):
    try:
        users = await db["users"].find({}).to_list(length=100)

        if len(users) <= 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No users found")

        return users

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))