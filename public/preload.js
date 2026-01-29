const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  // Autenticação & Chave
  validarChave: (chave) => ipcRenderer.invoke('validar-chave', chave),
  carregarChave: () => ipcRenderer.invoke('carregar-chave'),
  logout: () => ipcRenderer.invoke('logout'),

  // Terminal
  executarPowerShell: (script) => ipcRenderer.invoke('executar-powershell', script),
  executarCMD: (comando) => ipcRenderer.invoke('executar-cmd', comando),

  // Usuários
  listarUsuarios: () => ipcRenderer.invoke('listar-usuarios'),
  criarUsuario: (nome, senha, senhaExpira, admin) => ipcRenderer.invoke('criar-usuario', nome, senha, senhaExpira, admin),
  deletarUsuario: (nome) => ipcRenderer.invoke('deletar-usuario', nome),
  resetarSenhaUsuario: (nome, senha) => ipcRenderer.invoke('resetar-senha-usuario', nome, senha),

  // Otimizações
  aplicarOtimizacoes: (opcoes) => ipcRenderer.invoke('aplicar-otimizacoes', opcoes),

  // Instalação de Programas
  instalarProgramas: (opcoes) => ipcRenderer.invoke('instalar-programas', opcoes),

  // Office
  baixarOffice: () => {
    return new Promise((resolve) => {
      ipcRenderer.invoke('baixar-office').then(resolve)
    })
  },
  executarOffice: (caminho) => ipcRenderer.invoke('executar-office', caminho),
  onOfficeProgress: (callback) => {
    const unsubscribe = ipcRenderer.on('download-progress', (event, percentual) => {
      callback(percentual)
    })
    return unsubscribe
  },

  // Ativador
  ativarWindowsOffice: () => ipcRenderer.invoke('ativar-windows-office'),

  // Wallpaper
  salvarWallpaper: (buffer) => ipcRenderer.invoke('salvar-wallpaper', buffer),
  obterWallpaper: () => ipcRenderer.invoke('obter-wallpaper'),
  aplicarWallpaper: (caminho) => ipcRenderer.invoke('aplicar-wallpaper', caminho),
  deletarWallpaper: () => ipcRenderer.invoke('deletar-wallpaper'),

  // Eventos
  onProcessOutput: (callback) => {
    const unsubscribe = ipcRenderer.on('processo-output', (event, dados) => {
      callback(dados)
    })
    return unsubscribe
  }
})
