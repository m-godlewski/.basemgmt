from sqlalchemy.orm import Session
from models.item import Item
from schemas.item import ItemCreate, ItemUpdate
from typing import List, Optional


class ItemService:
    """Service layer for 'Item' operations with PostgreSQL."""

    @staticmethod
    def create_item(
        db: Session, item: ItemCreate, image_bytes: Optional[bytes] = None
    ) -> Item:
        # create a new Item object with provided data
        db_item = Item(
            name=item.name,
            description=item.description,
        )
        # if user uploaded an image, sets the image bytes to created instance
        if image_bytes:
            db_item.image = image_bytes
        # add the new item to database
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def get_all_items(db: Session, skip: int = 0, limit: int = 100) -> List[Item]:
        return db.query(Item).offset(skip).limit(limit).all()

    @staticmethod
    def get_item(db: Session, item_id: int) -> Optional[Item]:
        return db.query(Item).filter(Item.id == item_id).first()

    @staticmethod
    def update_item(
        db: Session, item_id: int, item: ItemUpdate, image_bytes: Optional[bytes] = None
    ) -> Optional[Item]:
        # fetches the existing item
        db_item = db.query(Item).filter(Item.id == item_id).first()
        # if item exists, updates its fields
        if db_item:
            # only updates fields that are provided in the request
            data = item.model_dump(exclude_unset=True)
            # updates item fields with given values
            for key, value in data.items():
                if hasattr(db_item, key):
                    setattr(db_item, key, value)
            # also updates image if new image is provided
            if image_bytes is not None:
                db_item.image = image_bytes
            db.commit()
            db.refresh(db_item)
        return db_item

    @staticmethod
    def delete_item(db: Session, item_id: int) -> bool:
        # fetches the item to be deleted
        db_item = db.query(Item).filter(Item.id == item_id).first()
        # if item exists deletes it and return True
        # otherwise returns False indicating item was not found
        if db_item:
            db.delete(db_item)
            db.commit()
            return True
        return False
