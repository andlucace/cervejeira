import { useState, useEffect } from 'react'
import type { Beer } from '../types'
import { beersApi, transactionsApi } from '../api/client'

interface Props {
  initialBeerId: number | null
  initialType: 'entrada' | 'saida'
  onSuccess: () => void
}

export default function RegisterTransaction({ initialBeerId, initialType, onSuccess }: Props) {
  const [beers, setBeers] = useState<Beer[]>([])
  const [beerId, setBeerId] = useState<number | ''>(initialBeerId ?? '')
  const [type, setType] = useState<'entrada' | 'saida'>(initialType)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    beersApi.list().then(setBeers).catch(() => {})
  }, [])

  useEffect(() => { setBeerId(initialBeerId ?? '') }, [initialBeerId])
  useEffect(() => { setType(initialType) }, [initialType])

  const selected = beers.find(b => b.id === beerId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!beerId) { setError('Selecione uma cerveja'); return }
    if (quantity <= 0) { setError('Quantidade deve ser maior que zero'); return }

    setLoading(true)
    setError(null)
    try {
      await transactionsApi.create({
        beer_id: beerId as number,
        type,
        quantity,
        notes: notes.trim() || undefined,
      })
      setDone(true)
      setTimeout(onSuccess, 1400)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Erro ao registrar movimentação')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="card success-screen">
        <div className="success-icon">{type === 'entrada' ? '📥' : '📤'}</div>
        <h3>{type === 'entrada' ? 'Entrada registrada!' : 'Saída registrada!'}</h3>
        <p>Voltando para o estoque...</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="section-title">Registrar Movimentação</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="type-selector">
          {(['entrada', 'saida'] as const).map(t => (
            <div
              key={t}
              className={`type-option ${type === t ? `selected ${t}` : ''}`}
              onClick={() => setType(t)}
            >
              <div className="type-icon">{t === 'entrada' ? '📥' : '📤'}</div>
              <div className="type-label">{t === 'entrada' ? 'Entrada' : 'Saída'}</div>
              <div className="type-desc">
                {t === 'entrada' ? 'Adicionou cervejas' : 'Retirou cervejas'}
              </div>
            </div>
          ))}
        </div>

        <div className="form-group">
          <label>Cerveja *</label>
          <select
            value={beerId}
            onChange={e => setBeerId(Number(e.target.value) || '')}
            required
          >
            <option value="">Selecione uma cerveja...</option>
            {beers.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} — {b.brand}
                {type === 'saida' ? ` (${b.stock} disponível)` : ''}
              </option>
            ))}
          </select>
        </div>

        {selected && type === 'saida' && (
          <div className="info-box">
            Estoque atual: <strong>{selected.stock} {selected.stock === 1 ? 'unidade' : 'unidades'}</strong>
          </div>
        )}

        <div className="form-group">
          <label>Quantidade *</label>
          <input
            type="number"
            min={1}
            max={type === 'saida' && selected ? selected.stock : undefined}
            value={quantity}
            onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
            required
          />
        </div>

        <div className="form-group">
          <label>Observações (opcional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: Compra no mercado, consumo no churrasco..."
            rows={2}
          />
        </div>

        <button
          type="submit"
          className={`btn ${type === 'entrada' ? 'btn-success' : 'btn-danger'}`}
          disabled={loading}
          style={{ width: '100%', padding: '13px' }}
        >
          {loading ? 'Registrando...' : `Confirmar ${type === 'entrada' ? 'Entrada' : 'Saída'}`}
        </button>
      </form>
    </div>
  )
}
