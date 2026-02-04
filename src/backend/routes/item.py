from fastapi import APIRouter, HTTPException
from schemas.item import ItemCreate, ItemUpdate, ItemResponse
from services.item import ItemService
from typing import List

router = APIRouter()


@router.post("/", response_model=ItemResponse, status_code=201)
def create_item(item: ItemCreate):
    """Creates a new item."""
    new_item = ItemService.create_item(name=item.name)
    return new_item


@router.get("/", response_model=List[ItemResponse])
def list_item():
    """Fetches all items."""
    return ItemService.get_all_items()


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(item_id: int):
    """Fetches an item by ID."""
    item = ItemService.get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")
    return item


@router.put("/{item_id}", response_model=ItemResponse)
def update_item(item_id: int, item: ItemUpdate):
    """Updates an item."""
    updated = ItemService.update_item()
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found.")
    return updated


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int):
    """Deletes an item."""
    if not ItemService.delete_item(item_id):
        raise HTTPException(status_code=404, detail="Item not found.")
    return None
