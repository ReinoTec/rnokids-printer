const axios = require('axios')
const crypto = require('crypto')
const config = require('./config')
const { BrowserWindow, ipcMain } = require('electron')
const path = require('path')

// Certificado do RNO Kids (comprado do QZ Tray)
const QZ_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIE0TCCArmgAwIBAgIQNzkyMDI1MTIxNTE2NDkxODANBgkqhkiG9w0BAQ0FADCB
mDELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAk5ZMRswGQYDVQQKDBJRWiBJbmR1c3Ry
aWVzLCBMTEMxGzAZBgNVBAsMElFaIEluZHVzdHJpZXMsIExMQzEZMBcGA1UEAwwQ
cXppbmR1c3RyaWVzLmNvbTEnMCUGCSqGSIb3DQEJARYYc3VwcG9ydEBxemluZHVz
dHJpZXMuY29tMB4XDTI1MTIxNTE2NDkxOFoXDTI2MTIxNTE2NDYwNlowgYoxCzAJ
BgNVBAYMAkJSMQswCQYDVQQIDAJTQzEQMA4GA1UEBwwHSXRhamHDrTERMA8GA1UE
CgwIUmVpbm90ZWMxETAPBgNVBAsMCFJlaW5vdGVjMRAwDgYDVQQDDAdSbm9LaWRz
MSQwIgYJKoZIhvcNAQkBDBVjb250YXRvQHJub3RlYy5jb20uYnIwggEiMA0GCSqG
SIb3DQEBAQUAA4IBDwAwggEKAoIBAQCcnSlk/9F/B9vZIlsndMWOjDyzG35wrgpV
mfiyWBkNjhVaAfRtchYd6uhJz3DXXX5wNakRRx+Lg+IjsHMd4k0JacraZYclfkCS
D4W04HFcIrD8qKcG0M+Cm1E65CcpIdWZ0R764Cq2INX0pAr/G7G4i7DwEbvQ+rUE
O371XD2g6npc0l6T0zdZABUowjSlhTDBRB+ro4qgF2MQFhlU4Ad1eas6mbcmkza2
TOcPQozJmo6bLMXL2dDegnkP77SfxvnpOO8ZXBFPROX84r/FiUfwpAlTWVRXLv4p
V/EIYR1nDFtQMClsInvRMloosOdS8Ps5/mhW1z5YHNfT8FTssFNjAgMBAAGjIzAh
MB8GA1UdIwQYMBaAFJCmULeE1LnqX/IFhBN4ReipdVRcMA0GCSqGSIb3DQEBDQUA
A4ICAQB0rpEh2KtglvOgOoFWIYw4MLZFcEUmZqH4WG2JppIMTzao9RCv4aJd/4pZ
9q5k9KE8KXmJuJeA41oeZafA6dux3aOfQNsfSZe+qO59/fUMNAoQBI8wAaXmFGuJ
x7eIA801/7vEzKAA3Z6u+VfZBPE95+hx6JinLgUq8g5mbXm/X+TwMyY0gqR9hbAF
G12ILlwYxGtbvFrSYsfh3vjXx4QD8LpuLO5qoXcelIxQSkMJncDWhk6v2sIvxBby
nVRWjQgc25jPIKOVJ37K4OSv0wWLJRhcjaYKGhjxZkHULXR2S3shTFJI7gtoZlbq
7dnMFVL7t2vEvOt+JdhOeGq2GNvhLuyOQb05AqOnqXnS4UMbDtN01QFus5hQxr9P
3LkhEJfeDs2p7xxjQMnp9OdII4RbU6eTMpNAWQJK+/63vywOkBj1FyYR7FKZP2o7
VXf2othUyXq6vJ/+F+w1LLVBVpzzsOa/FVW9iHXSCbkjWqmqhLHQqCWzmOTx8L5n
KponBXOvnZYALq7GJ1MI3IPBTy+VqqR0vwCOLuhRYrgEPidwdI0gp4v8OdfWNGUW
D2r3aP/Yt8+Irisx5J2cg6oG/H+rZhMdQXbYF68t41oAqUvftHBQQmBYSp3nHajU
/5BCvpKnmM5ryA03zxr2Fxhkv1MOfcjwvf+w82YG/JNpNggBkw==
-----END CERTIFICATE-----
--START INTERMEDIATE CERT--
-----BEGIN CERTIFICATE-----
MIIFEjCCA/qgAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwgawxCzAJBgNVBAYTAlVT
MQswCQYDVQQIDAJOWTESMBAGA1UEBwwJQ2FuYXN0b3RhMRswGQYDVQQKDBJRWiBJ
bmR1c3RyaWVzLCBMTEMxGzAZBgNVBAsMElFaIEluZHVzdHJpZXMsIExMQzEZMBcG
A1UEAwwQcXppbmR1c3RyaWVzLmNvbTEnMCUGCSqGSIb3DQEJARYYc3VwcG9ydEBx
emluZHVzdHJpZXMuY29tMB4XDTE1MDMwMjAwNTAxOFoXDTM1MDMwMjAwNTAxOFow
gZgxCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJOWTEbMBkGA1UECgwSUVogSW5kdXN0
cmllcywgTExDMRswGQYDVQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMxGTAXBgNVBAMM
EHF6aW5kdXN0cmllcy5jb20xJzAlBgkqhkiG9w0BCQEWGHN1cHBvcnRAcXppbmR1
c3RyaWVzLmNvbTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANTDgNLU
iohl/rQoZ2bTMHVEk1mA020LYhgfWjO0+GsLlbg5SvWVFWkv4ZgffuVRXLHrwz1H
YpMyo+Zh8ksJF9ssJWCwQGO5ciM6dmoryyB0VZHGY1blewdMuxieXP7Kr6XD3GRM
GAhEwTxjUzI3ksuRunX4IcnRXKYkg5pjs4nLEhXtIZWDLiXPUsyUAEq1U1qdL1AH
EtdK/L3zLATnhPB6ZiM+HzNG4aAPynSA38fpeeZ4R0tINMpFThwNgGUsxYKsP9kh
0gxGl8YHL6ZzC7BC8FXIB/0Wteng0+XLAVto56Pyxt7BdxtNVuVNNXgkCi9tMqVX
xOk3oIvODDt0UoQUZ/umUuoMuOLekYUpZVk4utCqXXlB4mVfS5/zWB6nVxFX8Io1
9FOiDLTwZVtBmzmeikzb6o1QLp9F2TAvlf8+DIGDOo0DpPQUtOUyLPCh5hBaDGFE
ZhE56qPCBiQIc4T2klWX/80C5NZnd/tJNxjyUyk7bjdDzhzT10CGRAsqxAnsjvMD
2KcMf3oXN4PNgyfpbfq2ipxJ1u777Gpbzyf0xoKwH9FYigmqfRH2N2pEdiYawKrX
6pyXzGM4cvQ5X1Yxf2x/+xdTLdVaLnZgwrdqwFYmDejGAldXlYDl3jbBHVM1v+uY
5ItGTjk+3vLrxmvGy5XFVG+8fF/xaVfo5TW5AgMBAAGjUDBOMB0GA1UdDgQWBBSQ
plC3hNS56l/yBYQTeEXoqXVUXDAfBgNVHSMEGDAWgBQDRcZNwPqOqQvagw9BpW0S
BkOpXjAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQAJIO8SiNr9jpLQ
eUsFUmbueoxyI5L+P5eV92ceVOJ2tAlBA13vzF1NWlpSlrMmQcVUE/K4D01qtr0k
gDs6LUHvj2XXLpyEogitbBgipkQpwCTJVfC9bWYBwEotC7Y8mVjjEV7uXAT71GKT
x8XlB9maf+BTZGgyoulA5pTYJ++7s/xX9gzSWCa+eXGcjguBtYYXaAjjAqFGRAvu
pz1yrDWcA6H94HeErJKUXBakS0Jm/V33JDuVXY+aZ8EQi2kV82aZbNdXll/R6iGw
2ur4rDErnHsiphBgZB71C5FD4cdfSONTsYxmPmyUb5T+KLUouxZ9B0Wh28ucc1Lp
rbO7BnjW
-----END CERTIFICATE-----`

// Chave privada do RNO Kids (comprada do QZ Tray)
const QZ_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCcnSlk/9F/B9vZ
IlsndMWOjDyzG35wrgpVmfiyWBkNjhVaAfRtchYd6uhJz3DXXX5wNakRRx+Lg+Ij
sHMd4k0JacraZYclfkCSD4W04HFcIrD8qKcG0M+Cm1E65CcpIdWZ0R764Cq2INX0
pAr/G7G4i7DwEbvQ+rUEO371XD2g6npc0l6T0zdZABUowjSlhTDBRB+ro4qgF2MQ
FhlU4Ad1eas6mbcmkza2TOcPQozJmo6bLMXL2dDegnkP77SfxvnpOO8ZXBFPROX8
4r/FiUfwpAlTWVRXLv4pV/EIYR1nDFtQMClsInvRMloosOdS8Ps5/mhW1z5YHNfT
8FTssFNjAgMBAAECggEADc/+mp3FSELVLO1OxMgTtGLB57oBCMcQukP+HxyN+RgS
4gFSIWTydmkFW50kApqIUDUrWA7BxXg4NZWWUYhn6vCdp21U4gWkhD1COZWh6dJV
cbMeKAe6hXZVT7BXk9UcFZjP9qhWnAGBXTYqkh1LK0+Gp2Wo/uFdnaXxqIoeFVb1
Y7YWP9kBm7iZHDkFXW6w2DYqpFPoBS0BxD+dLhZy2q6hvNGSVhVEKsvvUuUUgZiL
G454xdE1RhWMqR+al5dUi0UsRxRZ0/IldFK4ZcgrZ8B1W+iVWiWU43dPVmuBxABP
kg+CbyprKOBowOYkMk7Wg6cVkdSGuU/sI8dTAVgR4QKBgQDP1xpgJoFrp2lZ5xRF
AkRiHy4UCyDW+MWpokoTOWfq4Ser4gzwsgpERthvWyIdVeVKpw96YX+bxfqaz/1J
jI+PjD3aCWQ3IO1qpU4gW5yrNkm+CJXTZNCePe2Ka0bPwHt5wuzGyu7P8JgHkZdU
6WCp4B/S0wf+wX+xqiBTsuDoBQKBgQDA51vIToaz6/Rp5w4QqJDIqIH8/Tsc1xuP
NWXqN6eMrFk+FfekRzLsaLffZUV9JvM9v5q2DfaBTp4Rr4w1QNbbGcKWYUILEJRd
HXamemAR1f8Bk33SrMp8ktNVh4pDCuzY8WaeZGW0luwZfGW0Dai61GUsaryfLLsG
dubpojMyRwKBgQDM+F3SpSbNfHSxbOrYg7vc6NMQgUkJuJ13Bc33141cXmA5at1I
Is1tOFEKwN2MAMH4NXlWQAERJtZXBvfMKQsLjksRVGG43IhHvG6oCrEfSJLBDsZz
i+ERrhEtiU50ZGdhVZMdGdUazTOhgzuzSdVCsv2vdN9Vpo7AL/9hi++x4QKBgHul
0NccPoulew1G5WUYJ3X3TRr01qct2qR4/dKbyfIJp0p8mjfay3Ftzi6Lo3cNOG0k
G+8GFDPeSMPdWmnoHdBjOq9ZuBOPlQn6kMs1Nc849DP2bnhT+ZbQJlZ0gtNmdVq5
oaV1hRu0gbH0Ytx+xOC8s/08jZsZ+Oez319ycI6RAoGAK00lwHdHVW1bcjnzmx0f
B74noF77x8UH3XpLlXmRwHrF9nEnPzajBpaRNrEsGEAX1+2Okkp1Srb66sbEUT9G
fn8A8pZ16o85z5F66Cs4xSftUNtN/MzRv+z3tOevApS6hocbhss+V9adkGVHcuLd
KWC32u0S6Y4Rc9yGK1xT9F8=
-----END PRIVATE KEY-----`

class PrinterService {
  constructor() {
    this.qzBridge = null
    this.isConnected = false
    this.isPrinting = false
    this.stats = {
      impressasHoje: 0,
      erros: 0
    }
    this.setupIPC()
  }

  // Configurar IPC handlers
  setupIPC() {
    // Handler para assinar mensagens LOCALMENTE (usando chave privada comprada)
    ipcMain.handle('qz-sign', async (event, toSign) => {
      try {
        console.log('[PRINTER] 🔐 Assinando mensagem localmente...')
        const sign = crypto.createSign('SHA512')
        sign.update(toSign)
        const signature = sign.sign(QZ_PRIVATE_KEY, 'base64')
        console.log('[PRINTER] ✅ Mensagem assinada com sucesso')
        return signature
      } catch (error) {
        console.error('[PRINTER] ❌ Erro ao assinar:', error.message)
        throw error
      }
    })

    // Listener para conexão QZ
    ipcMain.on('qz-connected', (event, connected) => {
      this.isConnected = connected
      console.log(`[PRINTER] ${connected ? '✅ Conectado' : '❌ Desconectado'} ao QZ Tray`)
    })

    // Listener para sucesso de impressão
    ipcMain.on('qz-print-success', () => {
      console.log('[PRINTER] ✅ Impressão concluída')
      this.isPrinting = false
    })

    // Listener para erro de impressão
    ipcMain.on('qz-print-error', (event, error) => {
      console.error('[PRINTER] ❌ Erro na impressão:', error)
      this.isPrinting = false
    })
  }

  // Assinar mensagem usando a API do servidor (mesma que a versão web)
  async signMessage(message) {
    try {
      const response = await axios.post(
        `${config.getApiUrl()}/api/qz-sign`,
        { request: message },
        { headers: { 'Content-Type': 'application/json' } }
      )
      return response.data
    } catch (error) {
      console.error('[PRINTER] ❌ Erro ao assinar mensagem:', error.message)
      throw error
    }
  }

  // Conectar ao QZ Tray via BrowserWindow invisível
  async connectQZ() {
    return new Promise((resolve, reject) => {
      try {
        console.log('[PRINTER] 🔌 Criando bridge QZ Tray...')
        
        // Criar janela invisível para executar qz-tray.js
        this.qzBridge = new BrowserWindow({
          show: false, // Invisível
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
          }
        })

        // Carregar HTML com qz-tray.js
        this.qzBridge.loadFile(path.join(__dirname, 'qz-bridge.html'))

        // Aguardar conexão
        const timeout = setTimeout(() => {
          reject(new Error('Timeout ao conectar QZ Tray'))
        }, 10000)

        const onConnected = (event, connected) => {
          clearTimeout(timeout)
          if (connected) {
            console.log('[PRINTER] ✅ QZ Tray conectado via bridge')
            resolve(true)
          } else {
            reject(new Error('Falha ao conectar QZ Tray'))
          }
        }

        ipcMain.once('qz-connected', onConnected)

      } catch (error) {
        console.error('[PRINTER] ❌ Erro ao criar bridge:', error.message)
        reject(error)
      }
    })
  }

  // Enviar comando de impressão para a bridge
  async printViaQZ(printerName, htmlCrianca, htmlResponsavel) {
    return new Promise((resolve, reject) => {
      if (!this.qzBridge || !this.isConnected) {
        return reject(new Error('QZ Bridge não conectado'))
      }

      // Timeout
      const timeout = setTimeout(() => {
        reject(new Error('Timeout na impressão'))
      }, 30000)

      // Listeners temporários
      const onSuccess = () => {
        clearTimeout(timeout)
        ipcMain.removeListener('qz-print-success', onSuccess)
        ipcMain.removeListener('qz-print-error', onError)
        resolve()
      }

      const onError = (event, error) => {
        clearTimeout(timeout)
        ipcMain.removeListener('qz-print-success', onSuccess)
        ipcMain.removeListener('qz-print-error', onError)
        reject(new Error(error))
      }

      ipcMain.once('qz-print-success', onSuccess)
      ipcMain.once('qz-print-error', onError)

      // Enviar comando para bridge
      this.qzBridge.webContents.send('qz-print', {
        printerName,
        htmlCrianca,
        htmlResponsavel
      })
    })
  }

  // Buscar fila de impressão
  async buscarFila() {
    try {
      const token = config.getAuthToken()
      const organizacaoId = config.getOrganizacaoId()
      
      if (!token || !organizacaoId) {
        return []
      }

      const response = await axios.get(`${config.getApiUrl()}/api/fila-impressao`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          organizacao_id: organizacaoId,
          status: 'pendente'
        }
      })

      if (response.data && response.data.items) {
        return response.data.items
      }

      return []
    } catch (error) {
      console.error('[PRINTER] ❌ Erro ao buscar fila:', error.message)
      return []
    }
  }

  // Imprimir etiqueta
  async imprimirEtiqueta(item) {
    if (this.isPrinting || !this.isConnected) {
      return false
    }

    this.isPrinting = true

    try {
      console.log(`[PRINTER] 🖨️ Imprimindo: ${item.crianca_nome}`)

      // SEMPRE usar o nome da impressora da fila
      const printerName = item.impressora_nome
      
      if (!printerName) {
        throw new Error('Nome da impressora não especificado na fila')
      }
      
      console.log(`[PRINTER] 🖨️ Usando impressora: ${printerName}`)

      // Marcar como imprimindo
      await this.marcarComoImprimindo(item.id)

      // Imprimir via QZ Bridge (usa qz-tray.js do browser)
      await this.printViaQZ(
        printerName,
        item.html_crianca,
        item.html_responsavel
      )

      // Marcar como impresso
      await this.marcarComoImpresso(item.id)
      
      this.stats.impressasHoje++
      console.log(`[PRINTER] ✅ Etiqueta completa: ${item.crianca_nome}`)
      
      return true
    } catch (error) {
      console.error(`[PRINTER] ❌ Erro ao imprimir:`, error.message)
      await this.marcarComoErro(item.id, error.message)
      this.stats.erros++
      return false
    } finally {
      this.isPrinting = false
    }
  }

  // Marcar como imprimindo
  async marcarComoImprimindo(id) {
    try {
      const token = config.getAuthToken()
      await axios.post(
        `${config.getApiUrl()}/api/fila-impressao/imprimindo`,
        { id },
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
    } catch (error) {
      console.error('[PRINTER] ❌ Erro ao marcar como imprimindo:', error.message)
    }
  }

  // Marcar como impresso
  async marcarComoImpresso(id) {
    try {
      const token = config.getAuthToken()
      await axios.post(
        `${config.getApiUrl()}/api/fila-impressao/impresso`,
        { id },
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
    } catch (error) {
      console.error('[PRINTER] ❌ Erro ao marcar como impresso:', error.message)
    }
  }

  // Marcar como erro
  async marcarComoErro(id, mensagemErro) {
    try {
      const token = config.getAuthToken()
      await axios.post(
        `${config.getApiUrl()}/api/fila-impressao/erro`,
        { id, erro_mensagem: mensagemErro },
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
    } catch (error) {
      console.error('[PRINTER] ❌ Erro ao marcar erro:', error.message)
    }
  }

  // Processar fila
  async processarFila() {
    if (this.isPrinting || !this.isConnected) {
      return
    }

    try {
      const fila = await this.buscarFila()
      
      if (fila.length === 0) {
        return
      }

      console.log(`[PRINTER] 📋 ${fila.length} item(ns) na fila`)

      // Processar um item por vez
      for (const item of fila) {
        await this.imprimirEtiqueta(item)
        // Aguardar 1 segundo entre impressões
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error('[PRINTER] ❌ Erro ao processar fila:', error.message)
    }
  }

  // Iniciar serviço
  async start() {
    try {
      // Conectar ao QZ Tray
      await this.connectQZ()
      
      // Processar fila a cada 5 segundos
      setInterval(() => {
        this.processarFila()
      }, 5000)

      console.log('[PRINTER] 🚀 Serviço de impressão iniciado')
    } catch (error) {
      console.error('[PRINTER] ❌ Erro ao iniciar serviço:', error.message)
      
      // Tentar reconectar após 10 segundos
      setTimeout(() => {
        console.log('[PRINTER] 🔄 Tentando reconectar...')
        this.start()
      }, 10000)
    }
  }

  // Parar serviço
  stop() {
    if (this.ws) {
      this.ws.close()
    }
    this.isConnected = false
    console.log('[PRINTER] 🛑 Serviço de impressão parado')
  }

  // Obter estatísticas
  getStats() {
    return {
      isConnected: this.isConnected,
      impressasHoje: this.stats.impressasHoje,
      erros: this.stats.erros
    }
  }
}

module.exports = PrinterService
