from sqlalchemy import Column, Integer, String
from database import Base


class Item(Base):
    """Item model representing an item in the database."""

    __tablename__ = "item"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)

    def __repr__(self):
        return f"<Item(id={self.id}, name={self.name})>"
