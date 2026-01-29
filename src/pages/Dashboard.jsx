import React, { useState } from 'react'
import { Zap, LogOut, Terminal, Users, Wand2, Download, Lock, Image } from 'lucide-react'
import TerminalReal from '../components/TerminalReal'
import GerenciadorUsuarios from '../components/GerenciadorUsuarios'
import Otimizacao from '../components/Otimizacao'
import Instalacao from '../components/Instalacao'
import Ativador from '../components/Ativador'
import Wallpaper from '../components/Wallpaper'

export default function Dashboard({ onLogout }) {
  const [abaAtiva, setAbaAtiva] = useState('inicio')
  const [terminalAberto, setTerminalAberto] = useState(false)
  const [ultraFastAtivo, setUltraFastAtivo] = useState(false)
  const [ultraFastProgresso, setUltraFastProgresso] = useState(0)
  const [ultraFastEtapa, setUltraFastEtapa] = useState('')

  const abas = [
    { id: 'inicio', nome: 'Início', icon: Zap },
    { id: 'usuarios', nome: 'Usuários', icon: Users },
    { id: 'otimizacao', nome: 'Otimização', icon: Wand2 },
    { id: 'instalacao', nome: 'Instalação', icon: Download },
    { id: 'ativador', nome: 'Ativador', icon: Lock },
    { id: 'wallpaper', nome: 'Wallpaper', icon: Image },
    { id: 'terminal', nome: 'Terminal', icon: Terminal },
  ]

  const executarUltraFast = async () => {
    setUltraFastAtivo(true)
    setUltraFastProgresso(0)
    setUltraFastEtapa('')

    try {
      // 1. Instalação de Programas (25%)
      setUltraFastEtapa('Instalando programas...')
      setUltraFastProgresso(5)
      const instalaçãoResult = await window.electron.instalarProgramas({
        chrome: true,
        firefox: true,
        foxit: true,
        winrar: true,
        vlc: true,
        anydesk: true,
        dotnet: true
      })
      if (!instalaçãoResult.sucesso) throw new Error(instalaçãoResult.erro)
      setUltraFastProgresso(25)

      // 2. Baixar e Instalar Office (50%)
      setUltraFastEtapa('Baixando e instalando Office 365...')
      setUltraFastProgresso(26)
      const officeResult = await window.electron.baixarOffice()
      if (!officeResult.sucesso) throw new Error(officeResult.erro)
      setUltraFastProgresso(40)

      const execOfficeResult = await window.electron.executarOffice(officeResult.caminho)
      if (!execOfficeResult.sucesso) throw new Error(execOfficeResult.erro)
      setUltraFastProgresso(50)

      // 3. Otimização (65%)
      setUltraFastEtapa('Otimizando sistema...')
      setUltraFastProgresso(51)
      const otimizacaoResult = await window.electron.otimizar()
      if (!otimizacaoResult.sucesso) throw new Error(otimizacaoResult.erro)
      setUltraFastProgresso(65)

      // 4. Wallpaper (80%)
      setUltraFastEtapa('Aplicando wallpaper...')
      setUltraFastProgresso(66)
      const wallpaperResult = await window.electron.aplicarWallpaper()
      if (!wallpaperResult.sucesso) throw new Error(wallpaperResult.erro)
      setUltraFastProgresso(80)

      // 5. Ativador (100%)
      setUltraFastEtapa('Iniciando ativador...')
      setUltraFastProgresso(81)
      const ativadorResult = await window.electron.ativarWindowsOffice()
      if (!ativadorResult.sucesso) throw new Error(ativadorResult.erro)
      setUltraFastProgresso(100)

      setUltraFastEtapa('Ultra Fast concluído com sucesso!')
      setTimeout(() => {
        setUltraFastAtivo(false)
        setUltraFastProgresso(0)
        setUltraFastEtapa('')
      }, 2000)
    } catch (erro) {
      setUltraFastEtapa(`Erro: ${erro.message}`)
      setTimeout(() => {
        setUltraFastAtivo(false)
        setUltraFastProgresso(0)
        setUltraFastEtapa('')
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold">Tech Toolkit Pro</h1>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800 border-r border-slate-700 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {abas.map((aba) => {
              const Icon = aba.icon
              return (
                <button
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    abaAtiva === aba.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{aba.nome}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-8">
            {abaAtiva === 'inicio' && (
              <TelaInicio 
                onAbrirTerminal={() => setTerminalAberto(true)} 
                onAbrirUsuarios={() => setAbaAtiva('usuarios')} 
                onAbrirOtimizacao={() => setAbaAtiva('otimizacao')}
                onUltraFast={executarUltraFast}
                ultraFastProgresso={ultraFastProgresso}
              />
            )}
            {abaAtiva === 'usuarios' && <GerenciadorUsuarios />}
            {abaAtiva === 'otimizacao' && <Otimizacao />}
            {abaAtiva === 'instalacao' && <Instalacao />}
            {abaAtiva === 'ativador' && <Ativador />}
            {abaAtiva === 'wallpaper' && <Wallpaper />}
            {abaAtiva === 'terminal' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Terminal</h2>
                <button
                  onClick={() => setTerminalAberto(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-semibold"
                >
                  Abrir Terminal em Tela Cheia
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Ultra Fast */}
      {ultraFastAtivo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 w-96 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-center">⚡ Ultra Fast em Progresso</h3>

            {/* Barra de Progresso */}
            <div className="space-y-4 mb-6">
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                  style={{ width: `${ultraFastProgresso}%` }}
                />
              </div>
              <p className="text-center text-2xl font-bold text-purple-400">{ultraFastProgresso}%</p>
            </div>

            {/* Etapa Atual */}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-6">
              <p className="text-slate-300 text-sm">
                <strong>Etapa:</strong> {ultraFastEtapa}
              </p>
            </div>

            {/* Etapas */}
            <div className="space-y-2 text-sm">
              <div className={`flex items-center gap-2 ${ultraFastProgresso >= 25 ? 'text-green-400' : 'text-slate-400'}`}>
                <div className={`w-4 h-4 rounded-full ${ultraFastProgresso >= 25 ? 'bg-green-500' : 'bg-slate-600'}`} />
                Instalação de Programas
              </div>
              <div className={`flex items-center gap-2 ${ultraFastProgresso >= 50 ? 'text-green-400' : 'text-slate-400'}`}>
                <div className={`w-4 h-4 rounded-full ${ultraFastProgresso >= 50 ? 'bg-green-500' : 'bg-slate-600'}`} />
                Office 365
              </div>
              <div className={`flex items-center gap-2 ${ultraFastProgresso >= 65 ? 'text-green-400' : 'text-slate-400'}`}>
                <div className={`w-4 h-4 rounded-full ${ultraFastProgresso >= 65 ? 'bg-green-500' : 'bg-slate-600'}`} />
                Otimização
              </div>
              <div className={`flex items-center gap-2 ${ultraFastProgresso >= 80 ? 'text-green-400' : 'text-slate-400'}`}>
                <div className={`w-4 h-4 rounded-full ${ultraFastProgresso >= 80 ? 'bg-green-500' : 'bg-slate-600'}`} />
                Wallpaper
              </div>
              <div className={`flex items-center gap-2 ${ultraFastProgresso >= 100 ? 'text-green-400' : 'text-slate-400'}`}>
                <div className={`w-4 h-4 rounded-full ${ultraFastProgresso >= 100 ? 'bg-green-500' : 'bg-slate-600'}`} />
                Ativador
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Modal */}
      {terminalAberto && (
        <TerminalReal onClose={() => setTerminalAberto(false)} />
      )}
    </div>
  )
}

function TelaInicio({ onAbrirTerminal, onAbrirUsuarios, onAbrirOtimizacao, onUltraFast, ultraFastProgresso }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Bem-vindo ao Tech Toolkit Pro</h2>
        <p className="text-slate-400">
          Ferramentas profissionais para acelerar seu trabalho na bancada
        </p>
      </div>

      {/* Ultra Fast Button */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-2">⚡ Ultra Fast</h3>
        <p className="text-purple-100 text-sm mb-4">
          Executa otimização completa, instalação de programas, Office, ativação e wallpaper em um único clique.
        </p>
        <button
          onClick={onUltraFast}
          className="w-full px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-purple-50 transition flex items-center justify-center gap-2 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 hover:opacity-20 transition" />
          <span className="relative">⚡ Iniciar Ultra Fast</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            icon: Terminal,
            titulo: 'Terminal',
            descricao: 'Execute comandos PowerShell com privilégios',
            acao: onAbrirTerminal
          },
          {
            icon: Users,
            titulo: 'Usuários',
            descricao: 'Criar, deletar e resetar senhas',
            acao: onAbrirUsuarios
          },
          {
            icon: Wand2,
            titulo: 'Otimização',
            descricao: 'Melhora de sistema e personalização de aparência',
            acao: onAbrirOtimizacao
          },
          {
            icon: Zap,
            titulo: 'Mais',
            descricao: 'Muitas outras ferramentas em breve'
          }
        ].map((card, idx) => {
          const Icon = card.icon
          return (
            <button
              key={idx}
              onClick={card.acao}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500/50 transition cursor-pointer group text-left"
            >
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition">
                <Icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">{card.titulo}</h3>
              <p className="text-slate-400 text-sm">{card.descricao}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
