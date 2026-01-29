import React, { useState } from 'react'
import { Download, Loader, AlertCircle, CheckCircle } from 'lucide-react'

export default function Instalacao() {
  const [opcoes, setOpcoes] = useState({
    chrome: true,
    firefox: true,
    foxit: true,
    winrar: true,
    vlc: true,
    anydesk: true,
    dotnet: true
  })
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [etapa, setEtapa] = useState('programas')
  const [caminhoOffice, setCaminhoOffice] = useState('')
  const [progresso, setProgresso] = useState(0)

  const handleCheckbox = (opcao) => {
    setOpcoes(prev => ({
      ...prev,
      [opcao]: !prev[opcao]
    }))
  }

  const selecionarTodas = () => {
    setOpcoes({
      chrome: true,
      firefox: true,
      foxit: true,
      winrar: true,
      vlc: true,
      anydesk: true,
      dotnet: true
    })
  }

  const desmarcarTodas = () => {
    setOpcoes({
      chrome: false,
      firefox: false,
      foxit: false,
      winrar: false,
      vlc: false,
      anydesk: false,
      dotnet: false
    })
  }

  const instalarProgramas = async () => {
    const algumaSelecionada = Object.values(opcoes).some(v => v === true)
    if (!algumaSelecionada) {
      setErro('Selecione pelo menos um programa')
      return
    }
    setProcessando(true)
    setErro('')
    setSucesso('')
    try {
      const resultado = await window.electron.instalarProgramas(opcoes)
      if (resultado.sucesso) {
        setSucesso('Programas instalados com sucesso!')
      } else {
        setErro(resultado.erro || 'Erro ao instalar programas')
      }
    } catch (erro) {
      setErro('Erro: ' + erro.message)
    } finally {
      setProcessando(false)
    }
  }

const baixarOffice = async () => {
  setProcessando(true)
  setProgresso(0)
  setErro('')
  setSucesso('')

  // Listener para progresso
  const handleProgress = (e) => {
    setProgresso(e.detail)
  }
  window.addEventListener('office-progress', handleProgress)

  try {
    const resultado = await window.electron.baixarOffice()
    if (resultado.sucesso) {
      setCaminhoOffice(resultado.caminho)
      setSucesso('Office baixado! Iniciando instalador...')

      setTimeout(async () => {
        try {
          const resultadoExec = await window.electron.executarOffice(resultado.caminho)
          if (resultadoExec.sucesso) {
            setSucesso('Instalador do Office iniciado! Aguarde a conclusão da instalação.')
          } else {
            setErro(resultadoExec.erro || 'Erro ao executar Office')
          }
        } catch (erro) {
          setErro('Erro: ' + erro.message)
        } finally {
          setProcessando(false)
          setProgresso(0)
          window.removeEventListener('office-progress', handleProgress)
        }
      }, 1000)
    } else {
      setErro(resultado.erro || 'Erro ao baixar Office')
      setProcessando(false)
      setProgresso(0)
      window.removeEventListener('office-progress', handleProgress)
    }
  } catch (erro) {
    setErro('Erro: ' + erro.message)
    setProcessando(false)
    setProgresso(0)
    window.removeEventListener('office-progress', handleProgress)
  }
}




  const ativarWindowsOffice = async () => {
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
          <Download className="w-6 h-6 text-green-400" />
          Instalação de Programas
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Instale programas, Office e ative Windows
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

      {etapa === 'programas' && (
        <>
          <div className="flex gap-3">
            <button
              onClick={selecionarTodas}
              className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 rounded-lg transition text-green-300 font-medium"
            >
              Selecionar Todas
            </button>
            <button
              onClick={desmarcarTodas}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition font-medium"
            >
              Desmarcar Todas
            </button>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold mb-6">Selecione os programas a instalar:</h3>

            <label className="flex items-start gap-4 cursor-pointer hover:bg-slate-700/50 p-3 rounded-lg transition">
              <input
                type="checkbox"
                checked={opcoes.chrome}
                onChange={() => handleCheckbox('chrome')}
                className="w-5 h-5 accent-green-600 mt-1 flex-shrink-0"
              />
              <div>
                <p className="font-semibold text-white">Google Chrome</p>
                <p className="text-slate-400 text-sm">Navegador web rápido e seguro</p>
              </div>
            </label>

            <label className="flex items-start gap-4 cursor-pointer hover:bg-slate-700/50 p-3 rounded-lg transition">
              <input
                type="checkbox"
                checked={opcoes.firefox}
                onChange={() => handleCheckbox('firefox')}
                className="w-5 h-5 accent-green-600 mt-1 flex-shrink-0"
              />
              <div>
                <p className="font-semibold text-white">Mozilla Firefox</p>
                <p className="text-slate-400 text-sm">Navegador web com foco em privacidade</p>
              </div>
            </label>

            <label className="flex items-start gap-4 cursor-pointer hover:bg-slate-700/50 p-3 rounded-lg transition">
              <input
                type="checkbox"
                checked={opcoes.foxit}
                onChange={() => handleCheckbox('foxit')}
                className="w-5 h-5 accent-green-600 mt-1 flex-shrink-0"
              />
              <div>
                <p className="font-semibold text-white">Foxit PDF Reader</p>
                <p className="text-slate-400 text-sm">Leitor de PDF leve e rápido</p>
              </div>
            </label>

            <label className="flex items-start gap-4 cursor-pointer hover:bg-slate-700/50 p-3 rounded-lg transition">
              <input
                type="checkbox"
                checked={opcoes.winrar}
                onChange={() => handleCheckbox('winrar')}
                className="w-5 h-5 accent-green-600 mt-1 flex-shrink-0"
              />
              <div>
                <p className="font-semibold text-white">WinRAR</p>
                <p className="text-slate-400 text-sm">Compactador e descompactador de arquivos</p>
              </div>
            </label>

            <label className="flex items-start gap-4 cursor-pointer hover:bg-slate-700/50 p-3 rounded-lg transition">
              <input
                type="checkbox"
                checked={opcoes.vlc}
                onChange={() => handleCheckbox('vlc')}
                className="w-5 h-5 accent-green-600 mt-1 flex-shrink-0"
              />
              <div>
                <p className="font-semibold text-white">VLC Media Player</p>
                <p className="text-slate-400 text-sm">Reprodutor multimídia versátil</p>
              </div>
            </label>

            <label className="flex items-start gap-4 cursor-pointer hover:bg-slate-700/50 p-3 rounded-lg transition">
              <input
                type="checkbox"
                checked={opcoes.anydesk}
                onChange={() => handleCheckbox('anydesk')}
                className="w-5 h-5 accent-green-600 mt-1 flex-shrink-0"
              />
              <div>
                <p className="font-semibold text-white">AnyDesk</p>
                <p className="text-slate-400 text-sm">Acesso remoto e suporte técnico</p>
              </div>
            </label>

            <label className="flex items-start gap-4 cursor-pointer hover:bg-slate-700/50 p-3 rounded-lg transition">
              <input
                type="checkbox"
                checked={opcoes.dotnet}
                onChange={() => handleCheckbox('dotnet')}
                className="w-5 h-5 accent-green-600 mt-1 flex-shrink-0"
              />
              <div>
                <p className="font-semibold text-white">.NET Framework 4.8</p>
                <p className="text-slate-400 text-sm">Framework para aplicações .NET</p>
              </div>
            </label>
          </div>

          <button
            onClick={instalarProgramas}
            disabled={processando}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition font-semibold flex items-center justify-center gap-2"
          >
            {processando ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Instalando programas...
              </>
            ) : (
              'Instalar Programas'
            )}
          </button>

         {/* OFFICE 365 - DIV SEPARADA */}
<div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
  <h3 className="text-lg font-semibold">Microsoft Office 365</h3>
  <p className="text-slate-400">
    Baixe e instale o Office 365 64bits em Português Brasileiro automaticamente.
  </p>

  {processando && progresso > 0 && (
    <div className="space-y-2">
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-300"
          style={{ width: `${progresso}%` }}
        />
      </div>
      <p className="text-sm text-blue-400 text-center font-semibold">{progresso}%</p>
    </div>
  )}

  <button
    onClick={baixarOffice}
    disabled={processando}
    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition font-semibold flex items-center justify-center gap-2"
  >
    {processando ? (
      <>
        <Loader className="w-5 h-5 animate-spin" />
        Baixando e instalando Office...
      </>
    ) : (
      'Baixar e Instalar Office 365'
    )}
  </button>
</div>



        </>
      )}
    </div>
  )
}
