import React, { useState } from 'react'
import { Wand2, Loader, AlertCircle, CheckCircle } from 'lucide-react'

export default function Otimizacao() {
  const [opcoes, setOpcoes] = useState({
    desativarSysMain: true,
    planoEnergia: true,
    limpezaSistema: true,
    ajustesDesempenho: true,
    desativarTelemetria: true,
    desativarCortana: true,
    desativarSugestoes: true,
    desativarDiagnosticos: true,
  })

  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const handleCheckbox = (opcao) => {
    setOpcoes(prev => ({
      ...prev,
      [opcao]: !prev[opcao]
    }))
  }

  const selecionarTodas = () => {
    setOpcoes({
      desativarSysMain: true,
      planoEnergia: true,
      limpezaSistema: true,
      ajustesDesempenho: true,
      desativarTelemetria: true,
      desativarCortana: true,
      desativarSugestoes: true,
      desativarDiagnosticos: true,
    })
  }

  const desmarcarTodas = () => {
    setOpcoes({
      desativarSysMain: false,
      planoEnergia: false,
      limpezaSistema: false,
      ajustesDesempenho: false,
      desativarTelemetria: false,
      desativarCortana: false,
      desativarSugestoes: false,
      desativarDiagnosticos: false,
    })
  }

  const aplicarOtimizacoes = async () => {
    const algumaSelecionada = Object.values(opcoes).some(v => v === true)
    if (!algumaSelecionada) {
      setErro('Selecione pelo menos uma opção')
      return
    }

    setProcessando(true)
    setErro('')
    setSucesso('')

    try {
      const resultado = await window.electron.aplicarOtimizacoes(opcoes)

      if (resultado.sucesso) {
        setSucesso('Otimizações aplicadas com sucesso! O sistema pode precisar ser reiniciado.')
        selecionarTodas()
      } else {
        setErro(resultado.erro || 'Erro ao aplicar otimizações')
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
          <Wand2 className="w-6 h-6 text-blue-400" />
          Otimização
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Melhora de sistema e personalização de aparência
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

      <div className="flex gap-3">
        <button
          onClick={selecionarTodas}
          className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded-lg transition text-blue-300 font-medium"
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
        <h3 className="text-lg font-semibold mb-6">Selecione as otimizações desejadas:</h3>

        <div className="border-b border-slate-700 pb-4">
          <h4 className="text-sm font-bold text-blue-400 mb-3">⚡ Performance & Sistema</h4>

          <label className="flex items-start gap-4 cursor-pointer hover:bg-slate-700/50 p-3 rounded-lg transition">
            <input
              type="checkbox"
              checked={opcoes.desativarSysMain}
              onChange={() => handleCheckbox('desativarSysMain')}
              className="w-5 h-5 accent-blue-600 mt-1 flex-shrink-0"
            />
            <div>
              <p className="font-semibold text-white">Desativar SysMain</p>
              <p className="text-slate-400 text-sm">
                Desativa o serviço SysMain para melhorar o desempenho geral
              </p>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer hover:bg-slate-700/50 p-3 rounded-lg transition">
            <input
              type="checkbox"
              checked={opcoes.planoEnergia}
              onChange={() => handleCheckbox('planoEnergia')}
              className="w-5 h-5 accent-blue-600 mt-1 flex-shrink-0"
            />
            <div>
              <p className="font-semibold text-white">Plano de Energia - Desempenho Máximo</p>
              <p className="text-slate-400 text-sm">
                Cria e seleciona o plano de energia "Desempenho Máximo"
              </p>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer hover:bg-slate-700/50 p-3 rounded-lg transition">
            <input
              type="checkbox"
              checked={opcoes.limpezaSistema}
              onChange={() => handleCheckbox('limpezaSistema')}
              className="w-5 h-5 accent-blue-600 mt-1 flex-shrink-0"
            />
            <div>
              <p className="font-semibold text-white">Limpeza Automática do Sistema</p>
              <p className="text-slate-400 text-sm">
                Remove arquivos temporários, cache e lixeira
              </p>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer hover:bg-slate-700/50 p-3 rounded-lg transition">
            <input
              type="checkbox"
              checked={opcoes.ajustesDesempenho}
              onChange={() => handleCheckbox('ajustesDesempenho')}
              className="w-5 h-5 accent-blue-600 mt-1 flex-shrink-0"
            />
            <div>
              <p className="font-semibold text-white">Ajustes de Desempenho Visual</p>
              <p className="text-slate-400 text-sm">
                Abre as configurações de desempenho visual para otimizar
              </p>
            </div>
          </label>
        </div>

        <div className="border-b border-slate-700 pb-4">
          <h4 className="text-sm font-bold text-purple-400 mb-3">🔒 Privacidade & Telemetria</h4>

          <label className="flex items-start gap-4 cursor-pointer hover:bg-slate-700/50 p-3 rounded-lg transition">
            <input
              type="checkbox"
              checked={opcoes.desativarTelemetria}
              onChange={() => handleCheckbox('desativarTelemetria')}
              className="w-5 h-5 accent-blue-600 mt-1 flex-shrink-0"
            />
            <div>
              <p className="font-semibold text-white">Desativar Telemetria</p>
              <p className="text-slate-400 text-sm">
                Desativa serviços de telemetria do Windows (DiagTrack, dmwappushservice)
              </p>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer hover:bg-slate-700/50 p-3 rounded-lg transition">
            <input
              type="checkbox"
              checked={opcoes.desativarDiagnosticos}
              onChange={() => handleCheckbox('desativarDiagnosticos')}
              className="w-5 h-5 accent-blue-600 mt-1 flex-shrink-0"
            />
            <div>
              <p className="font-semibold text-white">Desativar Coleta de Dados e Diagnósticos</p>
              <p className="text-slate-400 text-sm">
                Desativa a coleta de dados de diagnóstico do Windows
              </p>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer hover:bg-slate-700/50 p-3 rounded-lg transition">
            <input
              type="checkbox"
              checked={opcoes.desativarCortana}
              onChange={() => handleCheckbox('desativarCortana')}
              className="w-5 h-5 accent-blue-600 mt-1 flex-shrink-0"
            />
            <div>
              <p className="font-semibold text-white">Desativar Cortana</p>
              <p className="text-slate-400 text-sm">
                Desativa o assistente virtual Cortana
              </p>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer hover:bg-slate-700/50 p-3 rounded-lg transition">
            <input
              type="checkbox"
              checked={opcoes.desativarSugestoes}
              onChange={() => handleCheckbox('desativarSugestoes')}
              className="w-5 h-5 accent-blue-600 mt-1 flex-shrink-0"
            />
            <div>
              <p className="font-semibold text-white">Desativar Sugestões de Apps</p>
              <p className="text-slate-400 text-sm">
                Remove sugestões de aplicativos e conteúdo do Windows
              </p>
            </div>
          </label>
        </div>
      </div>

      <button
        onClick={aplicarOtimizacoes}
        disabled={processando}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition font-semibold flex items-center justify-center gap-2"
      >
        {processando ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Aplicando otimizações...
          </>
        ) : (
          'Aplicar Otimizações'
        )}
      </button>
    </div>
  )
}
