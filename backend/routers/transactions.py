from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import get_db
from routers.beers import compute_stock

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=List[schemas.TransactionOut])
def list_transactions(
    beer_id: Optional[int] = None,
    type: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    q = db.query(models.Transaction).join(models.Beer)
    if beer_id:
        q = q.filter(models.Transaction.beer_id == beer_id)
    if type:
        q = q.filter(models.Transaction.type == type)
    txns = q.order_by(models.Transaction.created_at.desc()).limit(limit).all()
    return [
        schemas.TransactionOut(
            **{c.name: getattr(t, c.name) for c in models.Transaction.__table__.columns},
            beer_name=t.beer.name,
            beer_brand=t.beer.brand,
        )
        for t in txns
    ]


@router.post("/", response_model=schemas.TransactionOut, status_code=201)
def create_transaction(data: schemas.TransactionCreate, db: Session = Depends(get_db)):
    beer = db.query(models.Beer).filter(models.Beer.id == data.beer_id).first()
    if not beer:
        raise HTTPException(status_code=404, detail="Cerveja não encontrada")

    if data.type not in ("entrada", "saida"):
        raise HTTPException(status_code=400, detail="Tipo deve ser 'entrada' ou 'saida'")

    if data.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantidade deve ser maior que zero")

    if data.type == "saida":
        stock = compute_stock(data.beer_id, db)
        if stock < data.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Estoque insuficiente. Disponível: {stock}",
            )

    txn = models.Transaction(**data.model_dump())
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return schemas.TransactionOut(
        **{c.name: getattr(txn, c.name) for c in models.Transaction.__table__.columns},
        beer_name=beer.name,
        beer_brand=beer.brand,
    )
