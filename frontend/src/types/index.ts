export interface Beer {
  id: number
  name: string
  brand: string
  style?: string
  volume_ml?: number
  description?: string
  created_at: string
  stock: number
}

export interface BeerCreate {
  name: string
  brand: string
  style?: string
  volume_ml?: number
  description?: string
}

export interface Transaction {
  id: number
  beer_id: number
  type: 'entrada' | 'saida'
  quantity: number
  notes?: string
  created_at: string
  beer_name?: string
  beer_brand?: string
}

export interface TransactionCreate {
  beer_id: number
  type: 'entrada' | 'saida'
  quantity: number
  notes?: string
}
