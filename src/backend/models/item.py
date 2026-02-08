from sqlalchemy import Column, Integer, String, LargeBinary
from database import Base


class Item(Base):
    """Item model representing an item in the database."""

    __tablename__ = "item"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(String(255), nullable=True)
    image = Column(LargeBinary, nullable=True)

    @property
    def has_image(self) -> bool:
        """Returns True if item has an image."""
        return self.image is not None

    def __repr__(self):
        return f"<Item(id={self.id}, name={self.name})>"
