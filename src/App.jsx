import React, { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [autenticado, setAutenticado] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // Verificar se já tem chave salva
    if (window.electron) {
      window.electron.carregarChave().then((resultado) => {
        if (resultado.autenticado) {
          setAutenticado(true)
        }
        setCarregando(false)
      })
    } else {
      setCarregando(false)
    }
  }, [])

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  return autenticado ? (
    <Dashboard onLogout={() => setAutenticado(false)} />
  ) : (
    <Login onAutenticar={() => setAutenticado(true)} />
  )
}
