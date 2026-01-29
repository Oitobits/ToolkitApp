import React, { useState, useRef, useEffect } from 'react'
import { Send, Trash2 } from 'lucide-react'

export default function Terminal() {
  const [comandos, setComandos] = useState([])
  const [input, setInput] = useState('')
  const [executando, setExecutando] = useState(false)
  const terminalRef = useRef(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [comandos])

  const executar = async () => {
    if (!input.trim()) return

    const novoComando = {
      id: Date.now(),
      tipo: 'entrada',
      texto: input,
      timestamp: new Date().toLocaleTimeString()
    }

    setComandos((prev) => [...prev, novoComando])
    setExecutando(true)

    try {
      const resultado = await window.electron.executarPowerShell(input)

      setComandos((prev) => [...prev, {
        id: Date.now(),
        tipo: 'saida',
        texto: resultado.stdout || resultado.stderr || 'Comando executado',
        sucesso: resultado.sucesso
      }])
    } catch (erro) {
      setComandos((prev) => [...prev, {
        id: Date.now(),
        tipo: 'erro',
        texto: erro.message
      }])
    } finally {
      setExecutando(false)
      setInput('')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Terminal PowerShell</h2>

      <div
        ref={terminalRef}
        className="bg-black rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto border border-slate-700"
      >
        {comandos.length === 0 ? (
          <div className="text-slate-500">Digite um comando e pressione Enter...</div>
        ) : (
          comandos.map((cmd) => (
            <div key={cmd.id} className="mb-2">
              {cmd.tipo === 'entrada' && (
                <div className="text-blue-400">
                  <PS>{cmd.texto}</PS> 
                </div>
              )}
              {cmd.tipo === 'saida' && (
                <div className="text-green-400 whitespace-pre-wrap break-words">{cmd.texto}</div>
              )}
              {cmd.tipo === 'erro' && (
                <div className="text-red-400">{cmd.texto}</div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && executar()}
          placeholder="Digite um comando PowerShell..."
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          disabled={executando}
        />
        <button
          onClick={executar}
          disabled={executando}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg flex items-center gap-2 transition"
        >
          <Send className="w-4 h-4" />
        </button>
        <button
          onClick={() => setComandos([])}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
