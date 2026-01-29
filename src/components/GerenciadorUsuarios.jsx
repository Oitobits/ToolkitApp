import React, { useState, useEffect } from 'react'
import { Users, Plus, Trash2, Key, Loader, AlertCircle, CheckCircle } from 'lucide-react'

export default function GerenciadorUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [novaSenha, setNovaSenha] = useState('')
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', senha: '', senhaExpira: true, admin: false })

  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    carregarUsuarios()
  }, [])

  const carregarUsuarios = async () => {
    try {
      setCarregando(true)
      setErro('')
      const resultado = await window.electron.listarUsuarios()
      if (resultado.sucesso) {
        setUsuarios(resultado.usuarios || [])
      } else {
        setErro(resultado.erro || 'Erro ao carregar usuários')
      }
    } catch (erro) {
      setErro('Erro ao carregar usuários: ' + erro.message)
    } finally {
      setCarregando(false)
    }
  }

 const criarUsuario = async () => {
  const nomeTrimado = novoUsuario.nome.trim()
  const senhaTrimada = novoUsuario.senha.trim()

  if (!nomeTrimado || !senhaTrimada) {
    setErro('Nome e senha são obrigatórios')
    return
  }
  console.log('Dados enviados:', {
    nome: nomeTrimado,
    senha: senhaTrimada,
    senhaExpira: novoUsuario.senhaExpira,
    admin: novoUsuario.admin
  })
  setProcessando(true)
  setErro('')
  setSucesso('')
  try {
    const resultado = await window.electron.criarUsuario(
      nomeTrimado,
      senhaTrimada,
      novoUsuario.senhaExpira,
      novoUsuario.admin
    )
    if (resultado.sucesso) {
      setSucesso(`Usuário "${nomeTrimado}" criado com sucesso!`)
      setNovoUsuario({ nome: '', senha: '', senhaExpira: true, admin: false })
      setModalAberto(false)
      carregarUsuarios()
    } else {
      setErro(resultado.erro || 'Erro ao criar usuário')
    }
  } catch (erro) {
    setErro('Erro: ' + erro.message)
  } finally {
    setProcessando(false)
  }
}


  const deletarUsuario = async (nomeUsuario) => {
    if (!confirm(`Tem certeza que quer deletar o usuário "${nomeUsuario}"?`)) {
      return
    }
    setProcessando(true)
    setErro('')
    setSucesso('')
    try {
      const resultado = await window.electron.deletarUsuario(nomeUsuario)
      if (resultado.sucesso) {
        setSucesso(`Usuário "${nomeUsuario}" deletado!`)
        carregarUsuarios()
      } else {
        setErro(resultado.erro || 'Erro ao deletar usuário')
      }
    } catch (erro) {
      setErro('Erro: ' + erro.message)
    } finally {
      setProcessando(false)
    }
  }

  const abrirModalSenha = (nomeUsuario) => {
    setUsuarioSelecionado(nomeUsuario)
    setNovaSenha('')
    setModalSenhaAberto(true)
  }

  const resetarSenha = async () => {
    if (!novaSenha.trim()) {
      setErro('Digite uma nova senha')
      return
    }
    setProcessando(true)
    setErro('')
    setSucesso('')
    try {
      const resultado = await window.electron.resetarSenhaUsuario(
        usuarioSelecionado,
        novaSenha
      )
      if (resultado.sucesso) {
        setSucesso(`Senha de "${usuarioSelecionado}" resetada!`)
        setModalSenhaAberto(false)
        setNovaSenha('')
        carregarUsuarios()
      } else {
        setErro(resultado.erro || 'Erro ao resetar senha')
      }
    } catch (erro) {
      setErro('Erro: ' + erro.message)
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Gerenciador de Usuários
          </h2>
          <p className="text-slate-400 text-sm mt-1">Criar, deletar e resetar senhas de usuários</p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
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

      {carregando ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      ) : usuarios.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          Nenhum usuário encontrado
        </div>
      ) : (
        <div className="grid gap-4">
          {usuarios.map((usuario) => (
            <div
              key={usuario.nome}
              className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between hover:border-slate-600 transition"
            >
              <div>
                <h3 className="font-semibold">{usuario.nome}</h3>
                <p className="text-slate-400 text-sm">
                  {usuario.admin ? '👑 Administrador' : '👤 Usuário'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => abrirModalSenha(usuario.nome)}
                  disabled={processando}
                  className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 disabled:opacity-50 rounded-lg transition flex items-center gap-2"
                  title="Resetar senha"
                >
                  <Key className="w-4 h-4 text-yellow-400" />
                </button>
                <button
                  onClick={() => deletarUsuario(usuario.nome)}
                  disabled={processando}
                  className="p-2 bg-red-600/20 hover:bg-red-600/30 disabled:opacity-50 rounded-lg transition flex items-center gap-2"
                  title="Deletar usuário"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Novo Usuário */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Criar Novo Usuário</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome do Usuário
                </label>
                <input
                  type="text"
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                  placeholder="Ex: tecnico"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={novoUsuario.senha}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                  placeholder="Digite uma senha forte"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={novoUsuario.senhaExpira}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, senhaExpira: e.target.checked })}
                  className="w-5 h-5 accent-blue-600"
                />
                <span className="text-sm text-slate-300">Senha expira</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={novoUsuario.admin}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, admin: e.target.checked })}
                  className="w-5 h-5 accent-blue-600"
                />
                <span className="text-sm text-slate-300">Adicionar como Administrador</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalAberto(false)}
                disabled={processando}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={criarUsuario}
                disabled={processando}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition flex items-center justify-center gap-2"
              >
                {processando ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Resetar Senha */}
      {modalSenhaAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Resetar Senha</h3>
            <p className="text-slate-300 mb-4">Usuário: <strong>{usuarioSelecionado}</strong></p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalSenhaAberto(false)}
                disabled={processando}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={resetarSenha}
                disabled={processando}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg transition flex items-center justify-center gap-2"
              >
                {processando ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Resetando...
                  </>
                ) : (
                  'Resetar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
