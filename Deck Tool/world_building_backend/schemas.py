from datetime import timedelta

import pydantic
from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

class Card(BaseModel):
    card_id: int = None
    type: str = Field(min_length=1, max_length=30)
    range: list[str]
    notes: str = Field(min_length=0, max_length=200, default="")

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

class Deck(CamelModel):
    deck_id: int = None
    user_id: int = None
    deck_list: list[Card]
    deck_name: str = Field(min_length=1, max_length=40)
    deck_indices: list[int]
    current_card_id: int | None = None

class BaseUser(BaseModel):
    user_id: int = None
    username: str = Field(min_length=6, max_length=30)
    email: str = Field(min_length=5, max_length=40)
    first_name: str = Field(min_length=1, max_length=20)
    is_admin: bool = False

class User(BaseUser):
    password: str = Field(min_length=8, max_length=50)

class SignUpData(BaseModel):
    username: str = Field(min_length=6, max_length=30)
    email: str = Field(min_length=5, max_length=40)
    first_name: str = Field(min_length=1, max_length=20)
    password: str = Field(min_length=8, max_length=30)
    is_admin: bool = False

class LoginData(BaseModel):
    username: str = Field(min_length=6, max_length=30)
    password: str = Field(min_length=8, max_length=30)

class TokenData(BaseModel):
    username: str = Field(min_length=6, max_length=30)
    user_id: int
    is_admin: bool = False
    exp: timedelta

class UserBasicData(BaseModel):
    username: str = Field(min_length=6, max_length=30)
    email: str = Field(min_length=5, max_length=40)
    first_name: str = Field(min_length=1, max_length=20)
    is_admin: bool = False

class AdminStats(CamelModel):
    users_count: int
    avg_decks: float