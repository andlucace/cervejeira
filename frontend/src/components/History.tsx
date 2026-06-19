import { useState, useEffect } from 'react'
import type { Beer, Transaction } from '../types'
import { beersApi, transactionsApi } from '../api/client'

export default function History() {
  const [txns, setTxns] = useState<Transaction[]>([])
  const [beers, setBeers] = useState<Beer[]>([])
  const [typeFilter, setTypeFilter] = useState('')
  const [beerFilter, setBeerFilter] = useState<number | ''>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    beersApi.list().then(setBeers).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    transactionsApi
      .list({
        type: typeFilter || undefined,
        beer_id: beerFilter || undefined,
        limit: 150,
      })
      .then(setTxns)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [typeFilter, beerFilter])

  const fmt = (iso: string) =>
    new Date(iso + 'Z').toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  return (
    <div>
      <div className="card" style={{ padding: '16px' }}>
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Tipo</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">Todos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Cerveja</label>
            <select
              value={beerFilter}
              onChange={e => setBeerFilter(Number(e.target.value) || '')}
            >
              <option value="">Todas</option>
              {beers.map(b => (
                <option key={b.id} value={b.id}>{b.name} — {b.brand}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Carregando histórico...</div>
        ) : txns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>Nenhuma movimentação encontrada.</p>
          </div>
        ) : (
          txns.map(t => (
            <div key={t.id} className="txn-item">
              <div className={`txn-icon ${t.type}`}>
                {t.type === 'entrada' ? '📥' : '📤'}
              </div>
              <div className="txn-info">
                <div className="txn-beer">{t.beer_name}</div>
                <div className="txn-brand">{t.beer_brand}</div>
                {t.notes && <div className="txn-notes">{t.notes}</div>}
              </div>
              <div className="txn-right">
                <div className={`txn-qty ${t.type}`}>
                  {t.type === 'entrada' ? '+' : '−'}{t.quantity}
                </div>
                <div className="txn-date">{fmt(t.created_at)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
