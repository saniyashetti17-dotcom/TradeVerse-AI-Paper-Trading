from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import yfinance as yf
import pandas as pd
import ta

from database import engine, SessionLocal
from models import Base, Portfolio, Transaction, Watchlist

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

START_BALANCE = 1000000


class BuyRequest(BaseModel):
    stock: str
    quantity: int


class SellRequest(BaseModel):
    stock: str
    quantity: int


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_ticker(symbol: str):
    symbol = symbol.upper()

    if symbol == "GOLD":
        return "GC=F"
    if symbol == "SILVER":
        return "SI=F"
    if symbol == "CRUDE":
        return "CL=F"
    if symbol == "NIFTY":
        return "^NSEI"
    if symbol == "BANKNIFTY":
        return "^NSEBANK"

    return symbol + ".NS"


def get_live_price(symbol: str):
    try:
        ticker = get_ticker(symbol)

        hist = yf.download(
            ticker,
            period="5d",
            interval="1d",
            progress=False,
            auto_adjust=True,
        )

        if hist.empty:
            return {"price": 0, "change": "0%"}

        close_prices = hist["Close"].squeeze()

        price = float(close_prices.iloc[-1])
        previous_close = float(close_prices.iloc[-2]) if len(close_prices) > 1 else price

        change_percent = 0
        if previous_close:
            change_percent = ((price - previous_close) / previous_close) * 100

        return {
            "price": round(price, 2),
            "change": f"{change_percent:+.2f}%"
        }

    except Exception:
        return {
            "price": 0,
            "change": "0%"
        }


def generate_ai_signal(symbol: str):
    try:
        ticker = get_ticker(symbol)

        data = yf.download(
            ticker,
            period="6mo",
            interval="1d",
            progress=False,
            auto_adjust=True
        )

        if data.empty:
            return {
                "symbol": symbol,
                "signal": "HOLD",
                "confidence": 50,
                "price": 0,
                "target": 0,
                "stop_loss": 0,
                "risk": "High"
            }

        close = data["Close"].squeeze()

        data["RSI"] = ta.momentum.RSIIndicator(close).rsi()

        data["SMA20"] = ta.trend.SMAIndicator(
            close,
            window=20
        ).sma_indicator()

        data["SMA50"] = ta.trend.SMAIndicator(
            close,
            window=50
        ).sma_indicator()

        current_price = float(close.iloc[-1])

        rsi = float(data["RSI"].iloc[-1])
        sma20 = float(data["SMA20"].iloc[-1])
        sma50 = float(data["SMA50"].iloc[-1])

        score = 50

        # RSI
        if rsi < 30:
            score += 25
        elif rsi < 40:
            score += 15
        elif rsi > 70:
            score -= 25

        # SMA20
        if current_price > sma20:
            score += 15
        else:
            score -= 10

        # SMA50
        if current_price > sma50:
            score += 20
        else:
            score -= 15

        score = max(0, min(score, 100))

        if score >= 85:
            signal = "STRONG BUY"

        elif score >= 65:
            signal = "BUY"

        elif score >= 45:
            signal = "HOLD"

        else:
            signal = "SELL"

        target = round(current_price * 1.10, 2)
        stop_loss = round(current_price * 0.95, 2)

        if score >= 80:
            risk = "Low"
        elif score >= 60:
            risk = "Medium"
        else:
            risk = "High"

        return {
            "symbol": symbol.upper(),
            "signal": signal,
            "confidence": score,
            "price": round(current_price, 2),
            "target": target,
            "stop_loss": stop_loss,
            "risk": risk,
            "rsi": round(rsi, 2)
        }

    except Exception as e:
        return {
            "symbol": symbol.upper(),
            "signal": "HOLD",
            "confidence": 50,
            "price": 0,
            "target": 0,
            "stop_loss": 0,
            "risk": "High",
            "error": str(e)
        }


def calculate_balance(db: Session):
    buy_total = (
        db.query(Transaction)
        .filter(Transaction.type == "BUY")
        .with_entities(Transaction.total)
        .all()
    )

    sell_total = (
        db.query(Transaction)
        .filter(Transaction.type == "SELL")
        .with_entities(Transaction.total)
        .all()
    )

    total_buy = sum(item[0] for item in buy_total)
    total_sell = sum(item[0] for item in sell_total)

    return START_BALANCE - total_buy + total_sell


@app.get("/")
def home():
    return {"message": "Welcome to TradeVerse API"}


@app.get("/all-stocks")
def get_all_stocks():
    url = "https://archives.nseindia.com/content/equities/EQUITY_L.csv"

    try:
        df = pd.read_csv(url)
        df.columns = df.columns.str.strip()

        stock_list = []

        for _, row in df.iterrows():
            stock_list.append({
                "symbol": row["SYMBOL"],
                "name": row["NAME OF COMPANY"],
                "series": row["SERIES"]
            })

        return stock_list

    except Exception as e:
        return {"error": str(e)}


@app.get("/live-stock/{symbol}")
def get_live_stock(symbol: str):
    live = get_live_price(symbol)

    return {
        "symbol": symbol.upper(),
        "price": live["price"],
        "change": live["change"]
    }


@app.get("/live-stocks")
def get_live_stocks():
    symbols = ["TCS", "INFY", "RELIANCE", "HDFCBANK"]
    data = []

    for symbol in symbols:
        live = get_live_price(symbol)
        data.append({
            "symbol": symbol,
            "price": live["price"],
            "change": live["change"]
        })

    return data


@app.get("/commodities")
def get_commodities():
    items = ["GOLD", "SILVER", "CRUDE", "NIFTY", "BANKNIFTY"]
    data = []

    for item in items:
        live = get_live_price(item)
        data.append({
            "symbol": item,
            "price": live["price"],
            "change": live["change"]
        })

    return data


@app.get("/top-movers")
def top_movers():
    symbols = [
        "TCS", "INFY", "RELIANCE", "HDFCBANK",
        "SBIN", "ITC", "AXISBANK", "ICICIBANK",
        "LT", "MARUTI", "TITAN", "WIPRO"
    ]

    movers = []

    for symbol in symbols:
        live = get_live_price(symbol)

        try:
            change_value = float(live["change"].replace("%", ""))
        except:
            change_value = 0

        movers.append({
            "symbol": symbol,
            "price": live["price"],
            "change": live["change"],
            "change_value": change_value
        })

    gainers = sorted(
        movers,
        key=lambda x: x["change_value"],
        reverse=True
    )[:5]

    losers = sorted(
        movers,
        key=lambda x: x["change_value"]
    )[:5]

    return {
        "gainers": gainers,
        "losers": losers
    }


@app.get("/chart/{symbol}")
def get_chart(symbol: str):
    try:
        ticker = get_ticker(symbol)

        hist = yf.download(
            ticker,
            period="3mo",
            interval="1d",
            progress=False,
            auto_adjust=True,
        )

        chart_data = []

        if hist.empty:
            return chart_data

        close_prices = hist["Close"].squeeze()

        for date, price in close_prices.items():
            chart_data.append({
                "date": str(date.date()),
                "price": round(float(price), 2)
            })

        return chart_data

    except Exception as e:
        return {"error": str(e)}


@app.get("/ai-signal/{symbol}")
def ai_signal(symbol: str):
    return generate_ai_signal(symbol)


@app.get("/market-ai")
def market_ai():
    assets = [
        "TCS",
        "RELIANCE",
        "INFY",
        "HDFCBANK",
        "GOLD",
        "SILVER",
        "CRUDE",
        "NIFTY",
        "BANKNIFTY"
    ]

    results = []

    for asset in assets:
        results.append(generate_ai_signal(asset))

    return results


@app.post("/buy")
def buy_stock(order: BuyRequest, db: Session = Depends(get_db)):
    live = get_live_price(order.stock)
    selected_price = live["price"]

    if selected_price == 0:
        return {"error": "Live price not found"}

    total_cost = selected_price * order.quantity
    current_balance = calculate_balance(db)

    if total_cost > current_balance:
        return {"error": "Insufficient balance"}

    existing_holding = (
        db.query(Portfolio)
        .filter(Portfolio.stock == order.stock.upper())
        .first()
    )

    if existing_holding:
        new_qty = existing_holding.quantity + order.quantity
        new_total = existing_holding.total + total_cost
        new_avg_price = int(new_total // new_qty)

        existing_holding.quantity = new_qty
        existing_holding.buy_price = new_avg_price
        existing_holding.total = int(new_total)
    else:
        new_holding = Portfolio(
            stock=order.stock.upper(),
            quantity=order.quantity,
            buy_price=int(selected_price),
            total=int(total_cost)
        )
        db.add(new_holding)

    new_transaction = Transaction(
        type="BUY",
        stock=order.stock.upper(),
        quantity=order.quantity,
        price=int(selected_price),
        total=int(total_cost)
    )

    db.add(new_transaction)
    db.commit()

    return {
        "message": "Stock Bought Successfully",
        "price": selected_price,
        "remaining_balance": calculate_balance(db)
    }


@app.post("/sell")
def sell_stock(order: SellRequest, db: Session = Depends(get_db)):
    holding = (
        db.query(Portfolio)
        .filter(Portfolio.stock == order.stock.upper())
        .first()
    )

    if holding is None:
        return {"error": "Stock not found in portfolio"}

    if order.quantity > holding.quantity:
        return {"error": "Not enough quantity to sell"}

    live = get_live_price(order.stock)
    sell_price = live["price"]

    if sell_price == 0:
        sell_price = holding.buy_price

    total_amount = sell_price * order.quantity

    holding.quantity = holding.quantity - order.quantity
    holding.total = holding.quantity * holding.buy_price

    if holding.quantity == 0:
        db.delete(holding)

    new_transaction = Transaction(
        type="SELL",
        stock=order.stock.upper(),
        quantity=order.quantity,
        price=int(sell_price),
        total=int(total_amount)
    )

    db.add(new_transaction)
    db.commit()

    return {
        "message": "Stock Sold Successfully",
        "price": sell_price,
        "updated_balance": calculate_balance(db)
    }


@app.get("/portfolio")
def get_portfolio(db: Session = Depends(get_db)):
    return db.query(Portfolio).all()


@app.get("/portfolio-summary")
def get_portfolio_summary(db: Session = Depends(get_db)):
    holdings = db.query(Portfolio).all()
    result = []

    for holding in holdings:
        live = get_live_price(holding.stock)
        current_price = live["price"]

        if current_price == 0:
            current_price = holding.buy_price

        current_value = current_price * holding.quantity
        profit_loss = current_value - holding.total

        ai = generate_ai_signal(holding.stock)

        result.append({
            "stock": holding.stock,
            "quantity": holding.quantity,
            "buy_price": holding.buy_price,
            "current_price": int(current_price),
            "invested": holding.total,
            "current_value": int(current_value),
            "profit_loss": int(profit_loss),
            "ai_signal": ai.get("signal", "HOLD"),
            "confidence": ai.get("confidence", 50)
        })

    return result


@app.get("/portfolio-live-summary")
def get_portfolio_live_summary(db: Session = Depends(get_db)):
    return get_portfolio_summary(db)


@app.get("/portfolio-advisor")
def portfolio_advisor(db: Session = Depends(get_db)):
    holdings = db.query(Portfolio).all()

    advice = []

    for holding in holdings:

        ai = generate_ai_signal(holding.stock)

        recommendation = "HOLD"

        if ai["signal"] == "STRONG BUY":
            recommendation = "BUY MORE"

        elif ai["signal"] == "BUY":
            recommendation = "HOLD"

        elif ai["signal"] == "SELL":
            recommendation = "SELL"

        advice.append({
            "stock": holding.stock,
            "signal": ai["signal"],
            "confidence": ai["confidence"],
            "recommendation": recommendation
        })

    return advice


@app.get("/transactions")
def get_transactions(db: Session = Depends(get_db)):
    return db.query(Transaction).all()


@app.get("/balance")
def get_balance(db: Session = Depends(get_db)):
    return {"balance": calculate_balance(db)}


@app.post("/watchlist/{stock}")
def add_to_watchlist(stock: str, db: Session = Depends(get_db)):
    existing = (
        db.query(Watchlist)
        .filter(Watchlist.stock == stock.upper())
        .first()
    )

    if existing:
        return {"message": "Already in Watchlist"}

    new_item = Watchlist(stock=stock.upper())
    db.add(new_item)
    db.commit()

    return {"message": "Added to Watchlist"}


@app.get("/watchlist")
def get_watchlist(db: Session = Depends(get_db)):
    return db.query(Watchlist).all()


@app.delete("/watchlist/{stock}")
def remove_from_watchlist(stock: str, db: Session = Depends(get_db)):
    item = (
        db.query(Watchlist)
        .filter(Watchlist.stock == stock.upper())
        .first()
    )

    if item is None:
        return {"error": "Stock not found in Watchlist"}

    db.delete(item)
    db.commit()

    return {"message": "Removed from Watchlist"}