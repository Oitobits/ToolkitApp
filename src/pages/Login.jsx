import React, { useState, useEffect } from 'react'
import { AlertCircle, Lock, Loader } from 'lucide-react'

export default function Login({ onAutenticar }) {
  const [chave, setChave] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleValidar = async () => {
    if (!chave.trim()) {
      setErro('Por favor, insira uma chave')
      return
    }
    setCarregando(true)
    setErro('')
    try {
      const resultado = await window.electron.validarChave(chave)
      if (resultado.valida) {
        onAutenticar()
      } else {
        setErro(resultado.erro || 'Chave inválida')
      }
    } catch (erro) {
      setErro('Erro ao validar chave')
    } finally {
      setCarregando(false)
    }
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
    {/* Indicador de Conexão - Canto Superior Direito */}
    <div className="absolute top-6 right-6">
      <div className={`p-4 rounded-lg flex items-center gap-3 ${
        online 
          ? 'bg-green-900/20 border border-green-500/50' 
          : 'bg-red-900/20 border border-red-500/50'
      }`}>
        <div className={`w-3 h-3 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`} />
        <p className={online ? 'text-green-400' : 'text-red-400'}>
          {online ? 'Disponível' : 'Offline - Favor se conectar à internet'}
        </p>
      </div>
    </div>

    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Tech Toolkit Pro</h1>
        <p className="text-slate-400">Ferramentas profissionais para técnicos</p>
      </div>

      <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700">
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Chave de Acesso
          </label>
          <input
            type="text"
            value={chave}
            onChange={(e) => setChave(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleValidar()}
            placeholder="TECH-XXXX-XXXX-XXXX-XXXX"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </div>

        {erro && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{erro}</p>
          </div>
        )}

        <button
          onClick={handleValidar}
          disabled={carregando}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
        >
          {carregando ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Validando...
            </>
          ) : (
            'Acessar'
          )}
        </button>

        <p className="text-center text-slate-400 text-sm mt-6">
          Chave de teste: <span className="text-blue-400 font-mono">TECH-1234-5678-9ABC-DEF0</span>
        </p>
      </div>
    </div>
  </div>
)
}
