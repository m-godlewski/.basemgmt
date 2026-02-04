from sqlalchemy.orm import Session
from models.item import Item
from schemas.item import ItemCreate, ItemUpdate
from typing import List, Optional


class ItemService:
    """Service layer for 'Item' operations with PostgreSQL."""

    @staticmethod
    def create_item(db: Session, item: ItemCreate) -> Item:
        """Creates a new item in the database."""
        db_item = Item(
            name=item.name,
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def get_item(db: Session, item_id: int) -> Optional[Item]:
        """Fetches an item by ID."""
        return db.query(Item).filter(Item.id == item_id).first()

    @staticmethod
    def get_all_items(db: Session, skip: int = 0, limit: int = 100) -> List[Item]:
        """Fetches all items with pagination."""
        return db.query(Item).offset(skip).limit(limit).all()

    @staticmethod
    def update_item(db: Session, item_id: int, item: ItemUpdate) -> Optional[Item]:
        """Updates an item."""
        db_item = db.query(Item).filter(Item.id == item_id).first()
        if db_item:
            if item.name is not None:
                db_item.name = item.name
            db.commit()
            db.refresh(db_item)
        return db_item

    @staticmethod
    def delete_item(db: Session, item_id: int) -> bool:
        """Deletes an item."""
        db_item = db.query(Item).filter(Item.id == item_id).first()
        if db_item:
            db.delete(db_item)
            db.commit()
            return True
        return False
