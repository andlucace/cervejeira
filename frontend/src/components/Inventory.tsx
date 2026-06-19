import { useState, useEffect, useCallback } from 'react'
import type { Beer } from '../types'
import { beersApi } from '../api/client'

interface Props {
  onRegister: (beerId: number, type: 'entrada' | 'saida') => void
}

export default function Inventory({ onRegister }: Props) {
  const [beers, setBeers] = useState<Beer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setBeers(await beersApi.list())
    } catch {
      setError('Não foi possível carregar as cervejas. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: number) => {
    if (!confirm('Remover esta cerveja e todo o seu histórico?')) return
    try {
      await beersApi.remove(id)
      setBeers(b => b.filter(x => x.id !== id))
    } catch {
      alert('Erro ao remover cerveja.')
    } finally {
      setDeletingId(null)
    }
  }

  const stockClass = (s: number) => s === 0 ? 'empty' : s <= 3 ? 'low' : ''
  const stockLabel = (s: number) =>
    s === 0 ? 'Sem estoque' : `${s} ${s === 1 ? 'unidade' : 'unidades'}`

  const total = beers.reduce((a, b) => a + b.stock, 0)
  const available = beers.filter(b => b.stock > 0).length

  if (loading) return <div className="loading">Carregando estoque...</div>
  if (error)   return <div className="alert alert-error">{error}</div>

  return (
    <div>
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-value">{beers.length}</div>
          <div className="stat-label">Tipos cadastrados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total na cervejeira</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{available}</div>
          <div className="stat-label">Tipos disponíveis</div>
        </div>
      </div>

      {beers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍺</div>
          <p>Nenhuma cerveja cadastrada ainda.<br />Vá em <strong>Cadastrar</strong> para adicionar.</p>
        </div>
      ) : (
        <div className="beer-grid">
          {beers.map(beer => (
            <div key={beer.id} className="beer-card">
              <div className="beer-name">{beer.name}</div>
              <div className="beer-brand">{beer.brand}</div>
              {(beer.style || beer.volume_ml) && (
                <div className="beer-meta">
                  {[beer.style, beer.volume_ml && `${beer.volume_ml}ml`].filter(Boolean).join(' · ')}
                </div>
              )}
              <span className={`stock-badge ${stockClass(beer.stock)}`}>
                {stockLabel(beer.stock)}
              </span>
              <div className="beer-actions">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => onRegister(beer.id, 'entrada')}
                >
                  + Entrada
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onRegister(beer.id, 'saida')}
                  disabled={beer.stock === 0}
                >
                  − Saída
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ marginLeft: 'auto', fontSize: '1rem', padding: '4px 8px' }}
                  title="Remover cerveja"
                  onClick={() => { setDeletingId(beer.id); handleDelete(beer.id) }}
                  disabled={deletingId === beer.id}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
