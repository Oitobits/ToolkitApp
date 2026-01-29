
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const { spawn } = require('child_process')

// ========== FUNÇÃO AUXILIAR PARA POWERSHELL COM UTF-8 ==========
function executarPowerShell(comando) {
  return new Promise((resolve, reject) => {
    const cmdCompleto = `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; ${comando}`

    const processo = spawn('powershell', ['-NoProfile', '-Command', cmdCompleto], {
      encoding: 'utf8'
    })

    let stdout = ''
    let stderr = ''

    processo.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    processo.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    processo.on('close', (code) => {
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        code: code
      })
    })

    processo.on('error', (erro) => {
      reject(erro)
    })
  })
}
let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`

  mainWindow.loadURL(startUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)
// IPC: Listar usuários
ipcMain.handle('listar-usuarios', async () => {
  try {
    const resultado = await executarPowerShell(`
$usuarios = Get-LocalUser | Select-Object Name
$admins = @()
try {
  $admins = Get-LocalGroupMember -Group 'Administradores' -ErrorAction Stop | Select-Object -ExpandProperty Name
} catch {
  try {
    $admins = Get-LocalGroupMember -Group 'Administrators' -ErrorAction Stop | Select-Object -ExpandProperty Name
  } catch {
    $admins = @()
  }
}

$usuarios | ForEach-Object {
  $isAdmin = $false
  foreach ($admin in $admins) {
    if ($admin -like "*\\$($_.Name)" -or $admin -eq $_.Name) {
      $isAdmin = $true
      break
    }
  }
  [PSCustomObject]@{
    Name = $_.Name
    IsAdmin = $isAdmin
  }
} | ConvertTo-Json
`)

    if (resultado.code === 0 && resultado.stdout) {
      const usuarios = JSON.parse(resultado.stdout)
      const lista = Array.isArray(usuarios) ? usuarios : [usuarios]
      return {
        sucesso: true,
        usuarios: lista.map(u => ({
          nome: u.Name.trim(),
          admin: u.IsAdmin === true
        }))
      }
    }
    return { sucesso: true, usuarios: [] }
  } catch (erro) {
    console.error('Erro ao listar usuários:', erro)
    return { sucesso: false, erro: erro.message, usuarios: [] }
  }
})



// IPC: Criar usuário
ipcMain.handle('criar-usuario', async (event, nome, senha, senhaExpira = true, admin = false) => {
  try {
    console.log('Parâmetros recebidos:', { nome, senha, senhaExpira, admin })

    let comando = `
$senha = ConvertTo-SecureString -String '${senha}' -AsPlainText -Force
$novoUser = New-LocalUser -Name '${nome}' -Password $senha -FullName '${nome}' -Description 'Criado por Tech Toolkit' -ErrorAction Stop
Write-Host "USUARIO_CRIADO"
Add-LocalGroupMember -Group 'Users' -Member '${nome}' -ErrorAction SilentlyContinue
Write-Host "USERS_GROUP"
`

    if (admin) {
  comando += `
try {
  Add-LocalGroupMember -Group 'Administradores' -Member '${nome}' -ErrorAction Stop
} catch {
  Add-LocalGroupMember -Group 'Administrators' -Member '${nome}' -ErrorAction Stop
}
Write-Host "ADMIN_GROUP"
`
}

    if (!senhaExpira) {
      comando += `Set-LocalUser -Name '${nome}' -PasswordNeverExpires $true -ErrorAction Stop
Write-Host "SENHA_NUNCA_EXPIRA"
`
    }

    comando += `Write-Host "SUCESSO"`

    console.log('Comando:', comando)
    const resultado = await executarPowerShell(comando)

    console.log('Resultado stdout:', resultado.stdout)
    console.log('Resultado stderr:', resultado.stderr)
    console.log('Resultado code:', resultado.code)

    if (resultado.stdout.includes('SUCESSO') || resultado.code === 0) {
      return { sucesso: true }
    }

    return { sucesso: false, erro: resultado.stderr || 'Erro ao criar usuário' }
  } catch (erro) {
    console.error('Erro catch:', erro)
    return { sucesso: false, erro: erro.message }
  }
})


// IPC: Deletar usuário
ipcMain.handle('deletar-usuario', async (event, nome) => {
  try {
    const comando = `Remove-LocalUser -Name "${nome}" -Confirm:$false -ErrorAction Stop; Write-Host "SUCESSO"`

    const resultado = await executarPowerShell(comando)

    if (resultado.stdout.includes('SUCESSO') || resultado.code === 0) {
      return { sucesso: true }
    }

    return { sucesso: false, erro: resultado.stderr || 'Erro ao deletar usuário' }
  } catch (erro) {
    return { sucesso: false, erro: erro.message }
  }
})

// IPC: Resetar senha do usuário
ipcMain.handle('resetar-senha-usuario', async (event, nome, novaSenha) => {
  try {
    const comando = `
$senha = ConvertTo-SecureString -String '${novaSenha}' -AsPlainText -Force
$usuario = Get-LocalUser -Name "${nome}" -ErrorAction Stop
$usuario | Set-LocalUser -Password $senha -ErrorAction Stop
Write-Host "SUCESSO"
`

    const resultado = await executarPowerShell(comando)

    if (resultado.stdout.includes('SUCESSO') || resultado.code === 0) {
      return { sucesso: true }
    }

    return { sucesso: false, erro: resultado.stderr || 'Erro ao resetar senha' }
  } catch (erro) {
    return { sucesso: false, erro: erro.message }
  }
})


// IPC: Validar Chave de Acesso
ipcMain.handle('validar-chave', async (event, chave) => {
  try {
    const fs = require('fs')
    const path = require('path')

    // Caminho do arquivo de chave
    const chavePath = path.join(__dirname, 'chave.txt')

    console.log('Caminho da chave:', chavePath)
    console.log('Arquivo existe?', fs.existsSync(chavePath))

    // Verificar se o arquivo existe
    if (!fs.existsSync(chavePath)) {
      console.log('Arquivo não encontrado!')
      return { valida: false, erro: 'Arquivo de chave não encontrado' }
    }

    // Ler a chave do arquivo
    const chaveArmazenada = fs.readFileSync(chavePath, 'utf-8').trim()
    const chaveDigitada = chave.trim()

    console.log('Chave armazenada:', `"${chaveArmazenada}"`)
    console.log('Chave digitada:', `"${chaveDigitada}"`)
    console.log('São iguais?', chaveArmazenada === chaveDigitada)

    // Comparar chaves
    if (chaveDigitada === chaveArmazenada) {
      console.log('✓ Chave válida!')
      return { valida: true }
    } else {
      console.log('✗ Chave inválida!')
      return { valida: false, erro: 'Chave inválida' }
    }
  } catch (erro) {
    console.error('Erro ao validar chave:', erro)
    return { valida: false, erro: erro.message }
  }
})


// IPC: Aplicar Otimizações
ipcMain.handle('aplicar-otimizacoes', async (event, opcoes) => {
  try {
    const comandos = []

    // Desativar SysMain
    if (opcoes.desativarSysMain) {
      comandos.push(`
try {
  Stop-Service -Name "SysMain" -Force -ErrorAction Stop
  Set-Service -Name "SysMain" -StartupType Disabled -ErrorAction Stop
  Write-Output "✓ SysMain desativado com sucesso."
} catch {
  Write-Output "✗ Erro ao desativar SysMain: $_"
}
`)
    }

    // Plano de Energia - Desempenho Máximo
    if (opcoes.planoEnergia) {
      comandos.push(`
try {
  powercfg -setactive SCHEME_MIN
  powercfg -change -monitor-timeout-ac 0
  powercfg -change -standby-timeout-ac 0
  powercfg -change -disk-timeout-ac 0
  Write-Output "✓ Energia otimizada para alto desempenho."
} catch {
  Write-Output "✗ Erro ao aplicar energia alto desempenho: $_"
}
`)
    }

    // Limpeza de Sistema
    if (opcoes.limpezaSistema) {
      comandos.push(`
try {
  $folders = @(
    "$env:TEMP",
    "$env:APPDATA\\Microsoft\\Windows\\Recent",
    "$env:APPDATA\\Microsoft\\Windows\\NetHood",
    "C:\\Windows\\Temp",
    "C:\\Windows\\Prefetch"
  )

  foreach ($folder in $folders) {
    if (Test-Path $folder) {
      $count = (Get-ChildItem -Path $folder -Recurse -Force -ErrorAction SilentlyContinue).Count
      if ($count -gt 0) {
        Get-ChildItem -Path $folder -Recurse -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
        Write-Output "✓ $count arquivo(s) limpos em $folder."
      }
    }
  }

  if (Get-Command Clear-RecycleBin -ErrorAction SilentlyContinue) {
    Clear-RecycleBin -Force -ErrorAction SilentlyContinue
    Write-Output "✓ Lixeira limpa."
  }

  if (Test-Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RunMRU") {
    Remove-Item "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RunMRU" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Output "✓ Histórico 'Executar' limpo."
  }

  Write-Output "✓ Limpeza finalizada com sucesso."
} catch {
  Write-Output "✗ Erro ao executar limpeza: $_"
}
`)
    }

    // Abrir Ajustes de Desempenho Visual
    if (opcoes.ajustesDesempenho) {
      comandos.push(`
try {
  Start-Process "SystemPropertiesPerformance.exe"
  Write-Output "✓ Tela de desempenho aberta."
} catch {
  Write-Output "✗ Erro ao abrir ajustes de desempenho: $_"
}
`)
    }

    // Desativar Telemetria
    if (opcoes.desativarTelemetria) {
      comandos.push(`
try {
  # Parar serviços de telemetria
  $servicos = @("DiagTrack", "dmwappushservice", "waaSMedicSvc")
  foreach ($servico in $servicos) {
    try {
      Stop-Service -Name $servico -Force -ErrorAction SilentlyContinue
      Set-Service -Name $servico -StartupType Disabled -ErrorAction SilentlyContinue
    } catch {}
  }

  # Desativar tarefas agendadas de telemetria
  Disable-ScheduledTask -TaskName "Microsoft\\Windows\\Application Experience\\Microsoft Compatibility Appraiser" -ErrorAction SilentlyContinue | Out-Null
  Disable-ScheduledTask -TaskName "Microsoft\\Windows\\Application Experience\\ProgramDataUpdater" -ErrorAction SilentlyContinue | Out-Null
  Disable-ScheduledTask -TaskName "Microsoft\\Windows\\Autochk\\Proxy" -ErrorAction SilentlyContinue | Out-Null
  Disable-ScheduledTask -TaskName "Microsoft\\Windows\\Customer Experience Improvement Program\\Consolidator" -ErrorAction SilentlyContinue | Out-Null
  Disable-ScheduledTask -TaskName "Microsoft\\Windows\\Customer Experience Improvement Program\\UsbCeip" -ErrorAction SilentlyContinue | Out-Null

  Write-Output "✓ Telemetria desativada com sucesso."
} catch {
  Write-Output "✗ Erro ao desativar telemetria: $_"
}
`)
    }

    // Desativar Coleta de Dados e Diagnósticos
    if (opcoes.desativarDiagnosticos) {
      comandos.push(`
try {
  # Desativar coleta de dados
  Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" -Name "AllowDiagnosticData" -Value 0 -Force -ErrorAction SilentlyContinue

  # Desativar serviço de diagnóstico
  Stop-Service -Name "DiagTrack" -Force -ErrorAction SilentlyContinue
  Set-Service -Name "DiagTrack" -StartupType Disabled -ErrorAction SilentlyContinue

  # Desativar tarefas de diagnóstico
  Disable-ScheduledTask -TaskName "Microsoft\\Windows\\DiskDiagnostic\\Microsoft-Windows-DiskDiagnosticDataCollector" -ErrorAction SilentlyContinue | Out-Null

  Write-Output "✓ Coleta de dados e diagnósticos desativada."
} catch {
  Write-Output "✗ Erro ao desativar diagnósticos: $_"
}
`)
    }

    // Desativar Cortana
    if (opcoes.desativarCortana) {
      comandos.push(`
try {
  # Desativar Cortana via Registro
  Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Personalization\\Settings" -Name "AcceptedPrivacyPolicy" -Value 0 -Force -ErrorAction SilentlyContinue

  # Desativar busca na web do Cortana
  Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Search" -Name "BingSearchEnabled" -Value 0 -Force -ErrorAction SilentlyContinue
  Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Search" -Name "AllowSearchToUseLocation" -Value 0 -Force -ErrorAction SilentlyContinue

  # Desativar tarefas do Cortana
  Disable-ScheduledTask -TaskName "Microsoft\\Windows\\Application Experience\\StartupAppTask" -ErrorAction SilentlyContinue | Out-Null

  Write-Output "✓ Cortana desativada com sucesso."
} catch {
  Write-Output "✗ Erro ao desativar Cortana: $_"
}
`)
    }

    // Desativar Sugestões de Apps
    if (opcoes.desativarSugestoes) {
      comandos.push(`
try {
  # Desativar sugestões de apps
  Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager" -Name "ContentDeliveryAllowed" -Value 0 -Force -ErrorAction SilentlyContinue
  Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager" -Name "OemPreInstalledAppsEnabled" -Value 0 -Force -ErrorAction SilentlyContinue
  Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager" -Name "PreInstalledAppsEnabled" -Value 0 -Force -ErrorAction SilentlyContinue
  Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager" -Name "SilentInstalledAppsEnabled" -Value 0 -Force -ErrorAction SilentlyContinue
  Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager" -Name "SubscribedContentEnabled" -Value 0 -Force -ErrorAction SilentlyContinue

  # Desativar sugestões na tela de bloqueio
  Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager" -Name "RotatingLockScreenOverlayEnabled" -Value 0 -Force -ErrorAction SilentlyContinue

  Write-Output "✓ Sugestões de apps desativadas com sucesso."
} catch {
  Write-Output "✗ Erro ao desativar sugestões: $_"
}
`)
    }

    // Executar todos os comandos
    if (comandos.length === 0) {
      return { sucesso: false, erro: 'Nenhuma opção selecionada' }
    }

    const scriptCompleto = comandos.join('\n')
    const resultado = await executarPowerShell(scriptCompleto)

    if (resultado.code === 0) {
      return { sucesso: true, mensagem: 'Otimizações aplicadas com sucesso!' }
    } else {
      return { sucesso: false, erro: resultado.stderr || 'Erro ao aplicar otimizações' }
    }
  } catch (erro) {
    console.error('Erro ao aplicar otimizações:', erro)
    return { sucesso: false, erro: erro.message }
  }
})


// IPC: Executar PowerShell
ipcMain.handle('executar-powershell', async (event, script) => {
  return new Promise((resolve) => {
    const processo = spawn('powershell', ['-Command', script], {
      shell: true
    })

    let stdout = ''
    let stderr = ''

    processo.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    processo.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    processo.on('close', (code) => {
      resolve({
        sucesso: code === 0,
        stdout,
        stderr,
        codigo: code
      })
    })

    processo.on('error', (erro) => {
      resolve({
        sucesso: false,
        stderr: erro.message,
        codigo: 1
      })
    })
  })
})

// IPC: Instalar Programas via Winget
ipcMain.handle('instalar-programas', async (event, opcoes) => {
  try {
    const comandos = []

    // Chrome
    if (opcoes.chrome) {
      comandos.push(`
try {
  Write-Output "Instalando Google Chrome..."
  winget install --id Google.Chrome --silent --accept-package-agreements --accept-source-agreements
  Write-Output "✓ Chrome instalado com sucesso."
} catch {
  Write-Output "✗ Erro ao instalar Chrome: $_"
}
`)
    }

    // Firefox
    if (opcoes.firefox) {
      comandos.push(`
try {
  Write-Output "Instalando Mozilla Firefox..."
  winget install --id Mozilla.Firefox --silent --accept-package-agreements --accept-source-agreements
  Write-Output "✓ Firefox instalado com sucesso."
} catch {
  Write-Output "✗ Erro ao instalar Firefox: $_"
}
`)
    }

    // Foxit PDF Reader
    if (opcoes.foxit) {
      comandos.push(`
try {
  Write-Output "Instalando Foxit PDF Reader..."
  winget install --id Foxit.FoxitReader --silent --accept-package-agreements --accept-source-agreements
  Write-Output "✓ Foxit instalado com sucesso."
} catch {
  Write-Output "✗ Erro ao instalar Foxit: $_"
}
`)
    }

    // WinRAR
    if (opcoes.winrar) {
      comandos.push(`
try {
  Write-Output "Instalando WinRAR..."
  winget install --id RARLab.WinRAR --silent --accept-package-agreements --accept-source-agreements
  Write-Output "✓ WinRAR instalado com sucesso."
} catch {
  Write-Output "✗ Erro ao instalar WinRAR: $_"
}
`)
    }

    // VLC Media Player
    if (opcoes.vlc) {
      comandos.push(`
try {
  Write-Output "Instalando VLC Media Player..."
  winget install --id VideoLAN.VLC --silent --accept-package-agreements --accept-source-agreements
  Write-Output "✓ VLC instalado com sucesso."
} catch {
  Write-Output "✗ Erro ao instalar VLC: $_"
}
`)
    }

    // AnyDesk
    if (opcoes.anydesk) {
      comandos.push(`
try {
  Write-Output "Instalando AnyDesk..."
  winget install --id AnyDeskSoftwareGmbH.AnyDesk --silent --accept-package-agreements --accept-source-agreements
  Write-Output "✓ AnyDesk instalado com sucesso."
} catch {
  Write-Output "✗ Erro ao instalar AnyDesk: $_"
}
`)
    }

    // .NET Framework 4.8
    if (opcoes.dotnet) {
      comandos.push(`
try {
  Write-Output "Instalando .NET Framework 4.8..."
  winget install --id Microsoft.DotNet.Framework.DeveloperPack_4 --silent --accept-package-agreements --accept-source-agreements
  Write-Output "✓ .NET Framework 4.8 instalado com sucesso."
} catch {
  Write-Output "✗ Erro ao instalar .NET Framework 4.8: $_"
}
`)
    }

    if (comandos.length === 0) {
      return { sucesso: false, erro: 'Nenhum programa selecionado' }
    }

    const scriptCompleto = comandos.join('\n')
    const resultado = await executarPowerShell(scriptCompleto)

    if (resultado.code === 0) {
      return { sucesso: true, mensagem: 'Programas instalados com sucesso!' }
    } else {
      return { sucesso: false, erro: resultado.stderr || 'Erro ao instalar programas' }
    }
  } catch (erro) {
    console.error('Erro ao instalar programas:', erro)
    return { sucesso: false, erro: erro.message }
  }
})

// IPC: Baixar Office 365
ipcMain.handle('baixar-office', async (event) => {
  try {
    const { app } = require('electron')
    const path = require('path')
    const fs = require('fs')
    const https = require('https')

    const desktopPath = app.getPath('desktop')
    const officePath = path.join(desktopPath, 'Office365Installer.exe')

    // URL correta do Office 365
    const officeUrl = 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=O365ProPlusRetail&platform=x64&language=pt-br&version=O16GA'

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(officePath)

      const request = https.get(officeUrl, (response) => {
        // Segue redirects se necessário
        if (response.statusCode === 301 || response.statusCode === 302) {
          return https.get(response.headers.location, (redirectResponse) => {
            handleDownload(redirectResponse, file, event, officePath, resolve, reject)
          })
        }
        handleDownload(response, file, event, officePath, resolve, reject)
      })

      request.on('error', (err) => {
        fs.unlink(officePath, () => {})
        reject(err)
      })
    })
  } catch (erro) {
    console.error('Erro ao baixar Office:', erro)
    return { sucesso: false, erro: erro.message }
  }
})

// Função auxiliar para lidar com o download
function handleDownload(response, file, event, officePath, resolve, reject) {
  const totalSize = parseInt(response.headers['content-length'], 10)
  let downloadedSize = 0

  response.on('data', (chunk) => {
    downloadedSize += chunk.length
    const percentual = Math.round((downloadedSize / totalSize) * 100)
    event.sender.send('download-progress', percentual)
  })

  response.pipe(file)

  file.on('finish', () => {
    file.close()
    resolve({ sucesso: true, caminho: officePath })
  })

  file.on('error', (err) => {
    const fs = require('fs')
    fs.unlink(officePath, () => {})
    reject(err)
  })
}



// IPC: Executar instalador do Office
ipcMain.handle('executar-office', async (event, caminhoOffice) => {
  try {
    const { spawn } = require('child_process')

    return new Promise((resolve) => {
      spawn(caminhoOffice, [], { 
        detached: true,
        stdio: 'ignore'
      }).unref()

      resolve({ 
        sucesso: true, 
        mensagem: 'Instalador do Office iniciado!' 
      })
    })
  } catch (erro) {
    console.error('Erro ao executar Office:', erro)
    return { sucesso: false, erro: erro.message }
  }
})

// IPC: Ativar Windows e Office
ipcMain.handle('ativar-windows-office', async (event) => {
  try {
    const comando = `
try {
  Write-Output "Iniciando ativação do Windows e Office..."
  Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoProfile -ExecutionPolicy Bypass -Command "irm https://get.activated.win | iex"' -Verb RunAs
  Write-Output "✓ Ativador executado. Aguarde confirmação do sistema."
  Start-Sleep -Seconds 3
} catch {
  Write-Output "✗ Erro no ativador: $_"
}
`

    const resultado = await executarPowerShell(comando)

    if (resultado.code === 0) {
      return { sucesso: true, mensagem: 'Ativador iniciado com sucesso!' }
    } else {
      return { sucesso: false, erro: 'Erro ao executar ativador' }
    }
  } catch (erro) {
    console.error('Erro ao ativar:', erro)
    return { sucesso: false, erro: erro.message }
  }
})

// IPC: Selecionar arquivo de Wallpaper
ipcMain.handle('selecionar-arquivo', async (event) => {
  try {
    const { dialog } = require('electron')

    const resultado = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Imagens', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'gif'] },
        { name: 'Todos os arquivos', extensions: ['*'] }
      ]
    })

    return resultado
  } catch (erro) {
    console.error('Erro ao selecionar arquivo:', erro)
    return { cancelado: true, erro: erro.message }
  }
})


// IPC: Salvar Wallpaper no Cache
ipcMain.handle('salvar-wallpaper', async (event, dataUrl) => {
  try {
    const { app } = require('electron')
    const path = require('path')
    const fs = require('fs')

    const userDataPath = app.getPath('userData')
    const wallpaperDir = path.join(userDataPath, 'wallpaper')
    const wallpaperPath = path.join(wallpaperDir, 'wallpaper.jpg')

    // Criar pasta se não existir
    if (!fs.existsSync(wallpaperDir)) {
      fs.mkdirSync(wallpaperDir, { recursive: true })
    }

    // Extrair base64 da data URL
    const base64Data = dataUrl.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')
    fs.writeFileSync(wallpaperPath, buffer)

    return { 
      sucesso: true, 
      mensagem: 'Wallpaper salvo com sucesso!',
      caminho: wallpaperPath 
    }
  } catch (erro) {
    console.error('Erro ao salvar wallpaper:', erro)
    return { sucesso: false, erro: erro.message }
  }
})

// IPC: Obter caminho do Wallpaper em Cache
ipcMain.handle('obter-wallpaper', async (event) => {
  try {
    const { app } = require('electron')
    const path = require('path')
    const fs = require('fs')

    const userDataPath = app.getPath('userData')
    const wallpaperPath = path.join(userDataPath, 'wallpaper', 'wallpaper.jpg')

    if (fs.existsSync(wallpaperPath)) {
      // Converter para data URL
      const buffer = fs.readFileSync(wallpaperPath)
      const base64 = buffer.toString('base64')
      const dataUrl = `data:image/jpeg;base64,${base64}`

      return { 
        existe: true, 
        caminho: dataUrl
      }
    } else {
      return { 
        existe: false 
      }
    }
  } catch (erro) {
    console.error('Erro ao obter wallpaper:', erro)
    return { existe: false, erro: erro.message }
  }
})


// IPC: Aplicar Wallpaper
ipcMain.handle('aplicar-wallpaper', async (event, caminhoWallpaper) => {
  try {
    const comando = `
Add-Type -TypeDefinition @"
using System.Runtime.InteropServices;
public class Wallpaper {
  [DllImport("user32.dll", SetLastError = true)]
  public static extern bool SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@

try {
  [Wallpaper]::SystemParametersInfo(20, 0, "${caminhoWallpaper}", 3)
  Write-Output "✓ Wallpaper aplicado com sucesso."
} catch {
  Write-Output "✗ Erro ao aplicar wallpaper: $_"
}
`

    const resultado = await executarPowerShell(comando)

    if (resultado.code === 0) {
      return { sucesso: true, mensagem: 'Wallpaper aplicado com sucesso!' }
    } else {
      return { sucesso: false, erro: 'Erro ao aplicar wallpaper' }
    }
  } catch (erro) {
    console.error('Erro ao aplicar wallpaper:', erro)
    return { sucesso: false, erro: erro.message }
  }
})

// IPC: Deletar Wallpaper em Cache
ipcMain.handle('deletar-wallpaper', async (event) => {
  try {
    const { app } = require('electron')
    const path = require('path')
    const fs = require('fs')

    const userDataPath = app.getPath('userData')
    const wallpaperPath = path.join(userDataPath, 'wallpaper', 'wallpaper.jpg')

    if (fs.existsSync(wallpaperPath)) {
      fs.unlinkSync(wallpaperPath)
      return { sucesso: true, mensagem: 'Wallpaper deletado com sucesso!' }
    } else {
      return { sucesso: false, erro: 'Wallpaper não encontrado' }
    }
  } catch (erro) {
    console.error('Erro ao deletar wallpaper:', erro)
    return { sucesso: false, erro: erro.message }
  }
})


// IPC: Executar CMD
ipcMain.handle('executar-cmd', async (event, comando) => {
  return new Promise((resolve) => {
    const processo = spawn('cmd', ['/c', comando], {
      shell: true
    })

    let stdout = ''
    let stderr = ''

    processo.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    processo.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    processo.on('close', (code) => {
      resolve({
        sucesso: code === 0,
        stdout,
        stderr,
        codigo: code
      })
    })

    processo.on('error', (erro) => {
      resolve({
        sucesso: false,
        stderr: erro.message,
        codigo: 1
      })
    })
  })
})

// IPC: Carregar chave
ipcMain.handle('carregar-chave', async () => {
  return { autenticado: false }
})

// IPC: Logout
ipcMain.handle('logout', async () => {
  return { sucesso: true }
})
