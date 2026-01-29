import React, { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { X } from 'lucide-react'

export default function TerminalReal({ onClose }) {
  const terminalRef = useRef(null)
  const terminalInstanceRef = useRef(null)

  useEffect(() => {
    if (!terminalRef.current) return

    // Criar instância do terminal
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Courier New, monospace',
      theme: {
        background: '#000000',
        foreground: '#00ff00',
        cursor: '#00ff00',
      }
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(terminalRef.current)
    fitAddon.fit()

    terminalInstanceRef.current = term

    // Conectar ao terminal do Electron
    term.write('Tech Toolkit Pro - Terminal\r\n')
    term.write('Digite seus comandos PowerShell\r\n')
    term.write('PS> ')

    let buffer = ''

    term.onData((data) => {
      if (data === '\r') {
        // Enter pressionado
        term.write('\r\n')

        if (buffer.trim()) {
          executarComando(buffer, term)
        }

        buffer = ''
        term.write('PS> ')
      } else if (data === '\u007F') {
        // Backspace
        if (buffer.length > 0) {
          buffer = buffer.slice(0, -1)
          term.write('\b \b')
        }
      } else if (data.charCodeAt(0) < 32 && data !== '\t') {
        // Ignorar outros caracteres de controle
        return
      } else {
        buffer += data
        term.write(data)
      }
    })

    // Handle resize
    const handleResize = () => {
      fitAddon.fit()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      term.dispose()
    }
  }, [])

  const executarComando = async (comando, term) => {
    try {
      const resultado = await window.electron.executarPowerShell(comando)

      if (resultado.stdout) {
        term.write(resultado.stdout)
      }

      if (resultado.stderr) {
        term.write('\x1b[31m' + resultado.stderr + '\x1b[0m')
      }
    } catch (erro) {
      term.write('\x1b[31mErro: ' + erro.message + '\x1b[0m\r\n')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-11/12 h-5/6 bg-slate-900 rounded-lg shadow-2xl flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
          <h2 className="text-lg font-bold text-white">Terminal PowerShell</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Terminal */}
        <div className="flex-1 overflow-hidden p-4">
          <div
            ref={terminalRef}
            style={{
              width: '100%',
              height: '100%'
            }}
          />
        </div>
      </div>
    </div>
  )
}
