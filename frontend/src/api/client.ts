import axios from 'axios'
import type { Beer, BeerCreate, Transaction, TransactionCreate } from '../types'

type BeerUpdate = Partial<BeerCreate>

const http = axios.create({ baseURL: '/api' })

export const beersApi = {
  list: () => http.get<Beer[]>('/beers/').then(r => r.data),
  get: (id: number) => http.get<Beer>(`/beers/${id}`).then(r => r.data),
  create: (data: BeerCreate) => http.post<Beer>('/beers/', data).then(r => r.data),
  update: (id: number, data: BeerUpdate) => http.put<Beer>(`/beers/${id}`, data).then(r => r.data),
  remove: (id: number) => http.delete(`/beers/${id}`),
}

export const transactionsApi = {
  list: (params?: { beer_id?: number; type?: string; limit?: number }) =>
    http.get<Transaction[]>('/transactions/', { params }).then(r => r.data),
  create: (data: TransactionCreate) =>
    http.post<Transaction>('/transactions/', data).then(r => r.data),
}
