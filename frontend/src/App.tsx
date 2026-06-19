import { useState } from 'react'
import Inventory from './components/Inventory'
import RegisterTransaction from './components/RegisterTransaction'
import History from './components/History'
import AddBeer from './components/AddBeer'

type Tab = 'inventory' | 'register' | 'history' | 'add-beer'

interface RegisterCtx {
  beerId: number | null
  type: 'entrada' | 'saida'
}

export default function App() {
  const [tab, setTab] = useState<Tab>('inventory')
  const [registerCtx, setRegisterCtx] = useState<RegisterCtx>({ beerId: null, type: 'entrada' })

  const goRegister = (beerId: number, type: 'entrada' | 'saida') => {
    setRegisterCtx({ beerId, type })
    setTab('register')
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Cervejeira</h1>
        <p>Controle de entrada e saída de cervejas</p>
      </header>

      <nav className="nav">
        {([
          ['inventory', 'Estoque'],
          ['register', 'Registrar'],
          ['history', 'Histórico'],
          ['add-beer', 'Cadastrar'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? 'active' : ''}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === 'inventory' && (
          <Inventory onRegister={goRegister} />
        )}
        {tab === 'register' && (
          <RegisterTransaction
            initialBeerId={registerCtx.beerId}
            initialType={registerCtx.type}
            onSuccess={() => {
              setRegisterCtx({ beerId: null, type: 'entrada' })
              setTab('inventory')
            }}
          />
        )}
        {tab === 'history' && <History />}
        {tab === 'add-beer' && (
          <AddBeer onSuccess={() => setTab('inventory')} />
        )}
      </main>
    </div>
  )
}
