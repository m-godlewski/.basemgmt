from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from schemas.item import ItemCreate, ItemUpdate, ItemResponse
from services.item import ItemService
from database import get_db
from typing import List

router = APIRouter()


@router.post("/", response_model=ItemResponse, status_code=201)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    """Creates a new item."""
    return ItemService.create_item(db, item)


@router.get("/", response_model=List[ItemResponse])
def list_item(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Fetches all items."""
    return ItemService.get_all_items(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    """Fetches an item by ID."""
    item = ItemService.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")
    return item


@router.put("/{item_id}", response_model=ItemResponse)
def update_item(item_id: int, item: ItemUpdate, db: Session = Depends(get_db)):
    """Updates an item."""
    updated = ItemService.update_item(db, item_id, item)
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found.")
    return updated


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Deletes an item."""
    if not ItemService.delete_item(db, item_id):
        raise HTTPException(status_code=404, detail="Item not found.")
    return None
