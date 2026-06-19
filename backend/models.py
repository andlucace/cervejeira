from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Beer(Base):
    __tablename__ = "beers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    style = Column(String)
    volume_ml = Column(Integer)
    description = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    transactions = relationship(
        "Transaction", back_populates="beer", cascade="all, delete-orphan"
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    beer_id = Column(Integer, ForeignKey("beers.id"), nullable=False)
    type = Column(String, nullable=False)  # 'entrada' | 'saida'
    quantity = Column(Integer, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    beer = relationship("Beer", back_populates="transactions")
