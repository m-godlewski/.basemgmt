from fastapi import APIRouter, HTTPException, Depends, Response, UploadFile, File, Form
from sqlalchemy.orm import Session
from schemas.item import ItemCreate, ItemUpdate, ItemResponse
from services.item import ItemService
from database import get_db
from typing import List, Optional
import imghdr

router = APIRouter()


@router.post("/", response_model=ItemResponse, status_code=201, response_model_exclude={"image"})
async def create_item(
    name: str = Form(...),
    description: str = Form(default=""),
    image: UploadFile = File(default=None),
    db: Session = Depends(get_db)
):
    """Creates a new item with optional image upload."""
    item = ItemCreate(
        name=name,
        description=description if description else None
    )
    image_bytes = await image.read() if image else None
    return ItemService.create_item(db, item, image_bytes)


@router.get("/", response_model=List[ItemResponse], response_model_exclude={"image"})
def list_item(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Fetches all available items with pagination."""
    return ItemService.get_all_items(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=ItemResponse, response_model_exclude={"image"})
def get_item(item_id: int, db: Session = Depends(get_db)):
    """Fetches an item by ID."""
    item = ItemService.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")
    return item


@router.get("/{item_id}/image")
def get_item_image(item_id: int, db: Session = Depends(get_db)):
    """Returns raw image bytes for the item."""
    item = ItemService.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")
    if not item.has_image:
        raise HTTPException(status_code=404, detail="Image not found for this item.")
    # determines the image type
    img_type = imghdr.what(None, h=item.image)
    media_type = f"image/{img_type}" if img_type else "application/octet-stream"
    return Response(content=item.image, media_type=media_type)


@router.put("/{item_id}", response_model=ItemResponse, response_model_exclude={"image"})
async def update_item(
    item_id: int,
    name: Optional[str] = Form(default=None),
    description: Optional[str] = Form(default=None),
    image: UploadFile = File(default=None),
    db: Session = Depends(get_db)
):
    """Updates an item with optional image upload."""
    update_data = {}
    # checks if user provied new values for name and description
    if name is not None:
        update_data["name"] = name
    if description is not None:
        update_data["description"] = description
    # creates and ItemUpdate object with provided data
    item = ItemUpdate(**update_data)
    image_bytes = None
    # tries to read image bytes if user uploaded a new image
    if image:
        image_bytes = await image.read()
    # tries to update the item
    updated = ItemService.update_item(db, item_id, item, image_bytes)
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found.")
    return updated


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Deletes an item."""
    if not ItemService.delete_item(db, item_id):
        raise HTTPException(status_code=404, detail="Item not found.")
    return None
