from datetime import timedelta, datetime, timezone
import os
import jwt
from dotenv import load_dotenv
from fastapi import Depends, status, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError
from pwdlib import PasswordHash
from config import ALGORITHM
from schemas import User, TokenData
from database import get_db

password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

load_dotenv()

def verify_password(plain_password: str, hashed_password: str):
    return password_hash.verify(plain_password, hashed_password)

def hash_password(password):
    return password_hash.hash(password)

def create_token(data: dict, expires: timedelta = timedelta(minutes=15)):
    to_encode = data.copy()
    expire_time = datetime.now(timezone.utc) + expires
    to_encode.update(({"exp": expire_time}))
    encoded_jwt = jwt.encode(to_encode, os.getenv("JWT_SECRET_KEY"), algorithm=ALGORITHM)
    return encoded_jwt

async def get_user(username: str) -> User | None:
    user = await get_db()["users"].find_one({"username": username})
    return user

async def authenticate_user(username: str, password: str):
    user = await get_user(username)

    if not user or not verify_password(password, user["password"]):
        return None

    return user

async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate given credentials",
        headers={"WWW-Authenticate": "Bearer"},

    )
    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET_KEY"), algorithms=[ALGORITHM])
        username = payload.get("username")
        if username is None:
            raise credentials_exception
        user = await get_user(username)
        if user is None:
            raise credentials_exception
        return TokenData(
            username = username,
            user_id = payload["user_id"],
            is_admin = payload.get("is_admin", False),
            exp = payload["exp"]
        )
    except InvalidTokenError:
        raise credentials_exception
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

async def requires_admin(payload: dict = Depends(get_current_user)):
    is_admin = payload.is_admin or False
    if not is_admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="This user is not authorized for this action.")

    return payload

