from sqlalchemy import Column, Integer, String
from database import Base


class Portfolio(Base):
    __tablename__ = "portfolio"

    id = Column(Integer, primary_key=True, index=True)
    stock = Column(String)
    quantity = Column(Integer)
    buy_price = Column(Integer)
    total = Column(Integer)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    stock = Column(String)
    quantity = Column(Integer)
    price = Column(Integer)
    total = Column(Integer)


class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    stock = Column(String, unique=True, index=True)