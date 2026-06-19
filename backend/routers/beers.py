from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db

router = APIRouter(prefix="/beers", tags=["beers"])


def compute_stock(beer_id: int, db: Session) -> int:
    txns = db.query(models.Transaction).filter(models.Transaction.beer_id == beer_id).all()
    return sum(t.quantity if t.type == "entrada" else -t.quantity for t in txns)


@router.get("/", response_model=List[schemas.BeerOut])
def list_beers(db: Session = Depends(get_db)):
    beers = db.query(models.Beer).order_by(models.Beer.name).all()
    return [
        schemas.BeerOut(
            **{c.name: getattr(b, c.name) for c in models.Beer.__table__.columns},
            stock=compute_stock(b.id, db),
        )
        for b in beers
    ]


@router.post("/", response_model=schemas.BeerOut, status_code=201)
def create_beer(data: schemas.BeerCreate, db: Session = Depends(get_db)):
    beer = models.Beer(**data.model_dump())
    db.add(beer)
    db.commit()
    db.refresh(beer)
    return schemas.BeerOut(
        **{c.name: getattr(beer, c.name) for c in models.Beer.__table__.columns},
        stock=0,
    )


@router.get("/{beer_id}", response_model=schemas.BeerOut)
def get_beer(beer_id: int, db: Session = Depends(get_db)):
    beer = db.query(models.Beer).filter(models.Beer.id == beer_id).first()
    if not beer:
        raise HTTPException(status_code=404, detail="Cerveja não encontrada")
    return schemas.BeerOut(
        **{c.name: getattr(beer, c.name) for c in models.Beer.__table__.columns},
        stock=compute_stock(beer_id, db),
    )


@router.put("/{beer_id}", response_model=schemas.BeerOut)
def update_beer(beer_id: int, data: schemas.BeerUpdate, db: Session = Depends(get_db)):
    beer = db.query(models.Beer).filter(models.Beer.id == beer_id).first()
    if not beer:
        raise HTTPException(status_code=404, detail="Cerveja não encontrada")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(beer, field, value)
    db.commit()
    db.refresh(beer)
    return schemas.BeerOut(
        **{c.name: getattr(beer, c.name) for c in models.Beer.__table__.columns},
        stock=compute_stock(beer_id, db),
    )


@router.delete("/{beer_id}", status_code=204)
def delete_beer(beer_id: int, db: Session = Depends(get_db)):
    beer = db.query(models.Beer).filter(models.Beer.id == beer_id).first()
    if not beer:
        raise HTTPException(status_code=404, detail="Cerveja não encontrada")
    db.delete(beer)
    db.commit()
