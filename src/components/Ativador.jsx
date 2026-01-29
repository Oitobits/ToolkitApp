import React, { useState } from 'react'
import { Lock, Loader, AlertCircle, CheckCircle } from 'lucide-react'

export default function Ativador() {
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const ativar = async () => {
    setProcessando(true)
    setErro('')
    setSucesso('')

    try {
      const resultado = await window.electron.ativarWindowsOffice()

      if (resultado.sucesso) {
        setSucesso('Ativador iniciado com sucesso! O Windows e Office serão ativados em breve.')
      } else {
        setErro(resultado.erro || 'Erro ao executar ativador')
      }
    } catch (erro) {
      setErro('Erro: ' + erro.message)
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Lock className="w-6 h-6 text-purple-400" />
          Ativador
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Ative o Windows e Microsoft Office
        </p>
      </div>

      {erro && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-200">{erro}</p>
        </div>
      )}

      {sucesso && (
        <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-200">{sucesso}</p>
        </div>
      )}

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold mb-4">Ativar Windows & Office</h3>

        <p className="text-slate-400 mb-6">
          Clique no botão abaixo para iniciar o processo de ativação automática do Windows e Microsoft Office. Este processo pode levar alguns minutos.
        </p>

        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-300">
            ℹ️ <strong>Nota:</strong> O ativador será executado em segundo plano. Você pode fechar este aplicativo e continuar usando o computador normalmente.
          </p>
        </div>

        <button
          onClick={ativar}
          disabled={processando}
          className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition font-semibold flex items-center justify-center gap-2 text-lg"
        >
          {processando ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              Ativando...
            </>
          ) : (
            'Iniciar Ativação'
          )}
        </button>
      </div>
    </div>
  )
}
