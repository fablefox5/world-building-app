from dotenv import load_dotenv
from pymongo import AsyncMongoClient
import os


load_dotenv()


class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None

    def connect(self):
        if self.client is None:
            if os.getenv("MONGO_URI") is None:
                print("No URI found")
            self.client = AsyncMongoClient(os.getenv("MONGODB_URI"))
            self.db = self.client["world-build"]

    def disconnect(self):
        self.client.close()
        self.client = None
        self.db = None

db_manager = DatabaseManager()

def get_db():
    if db_manager.client is None:
        db_manager.connect()
    return db_manager.db