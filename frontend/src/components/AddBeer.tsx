import { useState } from 'react'
import type { BeerCreate } from '../types'
import { beersApi } from '../api/client'

interface Props {
  onSuccess: () => void
}

const STYLES = [
  'Lager', 'Pilsen', 'IPA', 'APA', 'Session IPA', 'Weizen', 'Witbier',
  'Stout', 'Porter', 'Amber Ale', 'Red Ale', 'Pale Ale', 'Saison',
  'Sour', 'Bock', 'Dunkel', 'Kolsch', 'Barleywine',
]

const VOLUMES = [
  { label: '269ml — long neck', value: 269 },
  { label: '310ml — lata', value: 310 },
  { label: '350ml — lata', value: 350 },
  { label: '473ml — lata grande', value: 473 },
  { label: '500ml', value: 500 },
  { label: '600ml — garrafa', value: 600 },
  { label: '1000ml — litrão', value: 1000 },
]

export default function AddBeer({ onSuccess }: Props) {
  const [form, setForm] = useState<BeerCreate>({ name: '', brand: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: keyof BeerCreate, value: string | number | undefined) =>
    setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.brand.trim()) {
      setError('Nome e marca são obrigatórios')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await beersApi.create({
        ...form,
        name: form.name.trim(),
        brand: form.brand.trim(),
        style: form.style || undefined,
        description: form.description || undefined,
      })
      setDone(true)
      setTimeout(onSuccess, 1400)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Erro ao cadastrar cerveja')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="card success-screen">
        <div className="success-icon">🍺</div>
        <h3>Cerveja cadastrada!</h3>
        <p>Voltando para o estoque...</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="section-title">Cadastrar Nova Cerveja</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Nome *</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Ex: Heineken, Stella Artois..."
              required
            />
          </div>
          <div className="form-group">
            <label>Marca *</label>
            <input
              value={form.brand}
              onChange={e => set('brand', e.target.value)}
              placeholder="Ex: Heineken, AmBev..."
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Estilo</label>
            <select value={form.style ?? ''} onChange={e => set('style', e.target.value || undefined)}>
              <option value="">Selecione...</option>
              {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Volume</label>
            <select
              value={form.volume_ml ?? ''}
              onChange={e => set('volume_ml', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Selecione...</option>
              {VOLUMES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Descrição (opcional)</label>
          <textarea
            value={form.description ?? ''}
            onChange={e => set('description', e.target.value || undefined)}
            placeholder="Notas, aromas, harmonizações..."
            rows={2}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', padding: '13px' }}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar Cerveja'}
        </button>
      </form>
    </div>
  )
}
