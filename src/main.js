const { app, Tray, Menu, BrowserWindow, ipcMain, nativeImage } = require('electron')
const path = require('path')
const config = require('./config')
const printer = require('./printer')

let tray = null
let mainWindow = null
let pollingInterval = null

// Prevenir múltiplas instâncias
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// Quando o app estiver pronto
app.on('ready', async () => {
  console.log('[RNO-PRINTER] 🚀 Aplicativo iniciado')
  
  // Criar ícone na bandeja
  createTray()
  
  // Verificar se está configurado
  if (config.isConfigured()) {
    console.log('[RNO-PRINTER] ✅ Configuração encontrada, iniciando serviço')
    await startPrinting()
  } else {
    console.log('[RNO-PRINTER] ⚠️ Não configurado, abrindo janela de configuração')
    createConfigWindow()
  }
})

// Criar ícone na bandeja do sistema
function createTray() {
  // Usar ícone 16x16 para o tray (Template para macOS)
  const iconPath = path.join(__dirname, '../assets/icons/png/16x16.png')
  let icon
  
  try {
    const fs = require('fs')
    if (fs.existsSync(iconPath)) {
      icon = nativeImage.createFromPath(iconPath)
    } else {
      console.log('[RNO-PRINTER] ⚠️ Ícone não encontrado, usando ícone padrão')
      icon = nativeImage.createEmpty()
    }
  } catch (error) {
    console.log('[RNO-PRINTER] ⚠️ Erro ao carregar ícone:', error.message)
    icon = nativeImage.createEmpty()
  }
  
  tray = new Tray(icon)
  
  updateTrayMenu()
  
  tray.setToolTip('RNO Kids Printer')
  
  // Duplo clique abre a janela
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show()
    } else {
      createMainWindow()
    }
  })
}

// Atualizar menu da bandeja
function updateTrayMenu() {
  const stats = printer.getStats()
  const organizacaoNome = config.get('organizacao_nome') || 'Não configurado'
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: `RNO Kids Printer`, 
      enabled: false,
      icon: nativeImage.createEmpty()
    },
    { type: 'separator' },
    { 
      label: `Organização: ${organizacaoNome}`,
      enabled: false 
    },
    { 
      label: stats.isConnected ? '✅ Conectado' : '❌ Desconectado',
      enabled: false 
    },
    { type: 'separator' },
    { 
      label: `📊 Impressas hoje: ${stats.impressasHoje}`,
      enabled: false 
    },
    { 
      label: `❌ Erros: ${stats.erros}`,
      enabled: false 
    },
    { type: 'separator' },
    { 
      label: '🔄 Reconectar',
      click: async () => {
        await startPrinting()
      }
    },
    { 
      label: '⚙️ Configurações',
      click: () => createConfigWindow()
    },
    { type: 'separator' },
    { 
      label: '❌ Sair',
      click: () => {
        if (pollingInterval) clearInterval(pollingInterval)
        app.quit()
      }
    }
  ])
  
  tray.setContextMenu(contextMenu)
}

// Criar janela principal
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../assets/icon.png')
  })
  
  mainWindow.loadFile(path.join(__dirname, 'index.html'))
  
  mainWindow.on('close', (event) => {
    event.preventDefault()
    mainWindow.hide()
  })
}

// Criar janela de configuração
function createConfigWindow() {
  const configWindow = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'Configuração - RNO Kids Printer'
  })
  
  configWindow.loadFile(path.join(__dirname, 'config.html'))
}

// Iniciar serviço de impressão
async function startPrinting() {
  console.log('[RNO-PRINTER] 🔄 Iniciando serviço de impressão')
  
  // Conectar ao QZ Tray
  const connected = await printer.connectQZ()
  
  if (!connected) {
    console.error('[RNO-PRINTER] ❌ Não foi possível conectar ao QZ Tray')
    // Tentar novamente em 10 segundos
    setTimeout(startPrinting, 10000)
    return
  }
  
  // Iniciar polling
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
  
  // Primeira busca imediata
  await processQueue()
  
  // Polling a cada 5 segundos
  const interval = config.getPollingInterval()
  pollingInterval = setInterval(async () => {
    await processQueue()
    updateTrayMenu() // Atualizar menu com estatísticas
  }, interval)
  
  console.log('[RNO-PRINTER] ✅ Serviço iniciado')
}

// Processar fila de impressão
async function processQueue() {
  try {
    const fila = await printer.buscarFila()
    
    if (fila.length > 0 && !printer.isPrinting) {
      console.log(`[RNO-PRINTER] 📋 ${fila.length} etiqueta(s) na fila`)
      await printer.imprimirEtiqueta(fila[0])
    }
  } catch (error) {
    console.error('[RNO-PRINTER] ❌ Erro ao processar fila:', error)
  }
}

// IPC Handlers para comunicação com janelas
ipcMain.handle('save-config', async (event, data) => {
  config.setAuthToken(data.token)
  config.setOrganizacao(data.organizacao_id, data.organizacao_nome)
  
  // Iniciar serviço
  await startPrinting()
  
  return { success: true }
})

ipcMain.handle('get-config', () => {
  return config.getAll()
})

ipcMain.handle('get-stats', () => {
  return printer.getStats()
})

// Não fechar o app ao fechar todas as janelas (manter na bandeja)
app.on('window-all-closed', (e) => {
  e.preventDefault()
})
