const axios = require('axios')
const WebSocket = require('ws')
const crypto = require('crypto')
const config = require('./config')

// Certificado do RNO Kids (do site)
const QZ_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIICyDCCAbACCQCula5h5a/W8DANBgkqhkiG9w0BAQsFADAmMREwDwYDVQQDDAhS
Tk8gS2lkczERMA8GA1UECgwIUmVpbm90ZWMwHhcNMjUxMjA4MTkyNTQyWhcNMzUx
MjA2MTkyNTQyWjAmMREwDwYDVQQDDAhSTk8gS2lkczERMA8GA1UECgwIUmVpbm90
ZWMwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDka/PLTQG8AMjnl3+O
wZ0zPSbsjJ70+znIW2of8YM+/K+MYIvazCr06cluhspNZw7WKNr2e35eJ1oEGUVc
5bc1PdE7gV2QhOwjq/NHhlfU8t9IwDA0LQR62iucdgnVBKd42j2Xp5qbzlT+M/Fw
YsJ7u7Pf5VGZdP8Ml+txBcgrA65epKZCrbODKi/EL2b60y5xrsb9RgS5t5JO33UW
/s8laeghg95UGh3qNn8kSr8cO+lFkY4xB6QdN/CiQodfo7NoNJCG/pUuVbPj//nB
TT9KgFBYgYFzwS0cim1DUkmulRImZ9F8JLuIuP1ZOCzE6vId+BkW+XAi4WeG/n/o
Qv8ZAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAErBrmm4L2C9TQT/9fjRxVUfZ1OY
QGzeG1Uki2LYZH+4Ec8UHt4CwG3OMPI8kBJuccWtwNZH9EDG46ZY0EOmOW8pFqyT
lKyklY4YdAtCIqyc0g8iqgVkK7PteOM7XCB5KBgxGHFSX6nnRjOJ7MEk1oPisySU
4ndQhfMZCHn46ZhdjpnDiS/IuA6I6C68uk1bAeEXO7JQIrP3cfyWsn1D+0IYCTrC
t1LUsAOk7uArbbY80ioqBMmk8x5mi2zZ8Y0tpi6+l+IER8IbO/TXntG8JuOa3NpB
YYX3AbElmJfspgBAVhACJtmiORBWob4FbZlboxKWJKz1AtKmfV/oP1wTQTY=
-----END CERTIFICATE-----`

// Chave privada do RNO Kids
const QZ_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDka/PLTQG8AMjn
l3+OwZ0zPSbsjJ70+znIW2of8YM+/K+MYIvazCr06cluhspNZw7WKNr2e35eJ1oE
GUVc5bc1PdE7gV2QhOwjq/NHhlfU8t9IwDA0LQR62iucdgnVBKd42j2Xp5qbzlT+
M/FwYsJ7u7Pf5VGZdP8Ml+txBcgrA65epKZCrbODKi/EL2b60y5xrsb9RgS5t5JO
33UW/s8laeghg95UGh3qNn8kSr8cO+lFkY4xB6QdN/CiQodfo7NoNJCG/pUuVbPj
//nBTT9KgFBYgYFzwS0cim1DUkmulRImZ9F8JLuIuP1ZOCzE6vId+BkW+XAi4WeG
/n/oQv8ZAgMBAAECggEAd2jHpbu38GQooojcMfCdETAirP5GCqNabZb8P36tsbu+
uY+vDM42lpmwp4rnLtd1NhddgATG5smDkSj0zb94quiJ/KWAGBCksXEuWHGucLAW
cZ2mlWADO4XZzo0WTrmEIvVTxXfkpxaR7+GPkcTPDoftXFow8hvrSNYSSp9PKMxi
u2UhyuLr737db7rbWQ+vP9pNUa0adc0g6IRbc1UchqTYOX6eB8he95VSXiP6CyqR
pKr2Hayi7XgMUD1CL5AG8tcVN3ITca09lsT9UUIP25f/T/sy1sjB09j3G6Uz2lhY
WUcG+XSHAE+7K6a3Yg7Z6FN4ZH4bGLqrqBInsag3EQKBgQD9eF9yRmdMREFJYK0T
BeZBil0V9CdnzTTfDADXX/0o+jiYMZlduDyDM+vaQaUSZFfbp7t08ib7edivZ4A9
Qj3BgTAH+4JCoPxRBXko11bgN+L9spH4TpLrUWWRASCvfKao8cDjYLQ8jv3+6mDx
04voRDi8k9mxHgU5rVsDdrr6fwKBgQDms5RXKi3nLs76qfxAnn5VXpChEzQ4xhOF
wfp5ErtZ3Ryyfm+Sdu9HM8sutTpmwR86PySn/bqLsJc5RuHVkjfWUsCvSsfzPNpN
pd4Xb3Og0PqstEOAwvAz4/2nWa8rjI2zG/fl0wWb9i7gsqzD2+TpdPsp//tfzRLn
M6an9qDKZwKBgQDNVY1kwrn947FL40ByD65nW9Jq7X5arbduFYg88arhXksop82J
Sa3jz9T524IBMz6lV+0ZIO4JfLzX463Ucmwa7S/e15W/qjCc5iUvu7rKKxv8z4NG
t0h3z1nLLTGwV/efFzFeQcHg6SnEL1TXsrs9Lr8TrWaGAD7VaaU4Wh/AuwKBgQCg
MxGOWa7Ye2ulKscNBEJL+8fI4nH//qPt3R6WVoicxWs5E41ckpRjyDaOb7BnTDHo
G5LTyOByQiUw0+TcjpWRkZNV5kLkyFv7UXPgqDcN9DAuH1tEnZl5HxezzxZR0l9P
gdtpz1h0zcYNqGVJ+HeEGgSTTLt88gXvYLGYry1GfwKBgQDq78CaOR9mqftbPdRg
1UnfohQmPfnHwEzFdu4sS8k4/BVN+6/twBXn3W45yth/0PNBdKfxdk03LpKWiC8G
n3KNu5kswrCGLFyV79x9Ka1lMD4uLzcYTv5bT5inv6dqEeFAZ+jIwkbsb0yDFlit
EQ2OZBsSXMs1+YHLQlacfpHMrg==
-----END PRIVATE KEY-----`

class PrinterService {
  constructor() {
    this.ws = null
    this.isConnected = false
    this.isPrinting = false
    this.messageId = 0
    this.pendingMessages = new Map()
    this.stats = {
      impressasHoje: 0,
      erros: 0
    }
  }

  // Assinar mensagem com certificado
  signMessage(message) {
    const sign = crypto.createSign('SHA256')
    sign.update(message)
    sign.end()
    return sign.sign(QZ_PRIVATE_KEY, 'base64')
  }

  // Conectar ao QZ Tray via WebSocket
  async connectQZ() {
    return new Promise((resolve, reject) => {
      try {
        console.log('[PRINTER] 🔌 Conectando ao QZ Tray...')
        
        // Conectar ao WebSocket do QZ Tray (porta 8182)
        this.ws = new WebSocket('wss://localhost:8182', {
          rejectUnauthorized: false // Aceitar certificado auto-assinado do QZ Tray
        })

        this.ws.on('open', () => {
          console.log('[PRINTER] ✅ Conectado ao QZ Tray via WebSocket')
          this.isConnected = true
          
          // Configurar certificado
          this.sendMessage('setCertificate', [QZ_CERTIFICATE])
            .then(() => {
              console.log('[PRINTER] 🔐 Certificado configurado')
              resolve(true)
            })
            .catch(reject)
        })

        this.ws.on('message', (data) => {
          try {
            const response = JSON.parse(data.toString())
            
            // Processar resposta
            if (response.uid && this.pendingMessages.has(response.uid)) {
              const { resolve, reject } = this.pendingMessages.get(response.uid)
              this.pendingMessages.delete(response.uid)
              
              if (response.error) {
                reject(new Error(response.error))
              } else {
                resolve(response.result)
              }
            }
          } catch (error) {
            console.error('[PRINTER] ❌ Erro ao processar mensagem:', error)
          }
        })

        this.ws.on('error', (error) => {
          console.error('[PRINTER] ❌ Erro WebSocket:', error.message)
          this.isConnected = false
          reject(error)
        })

        this.ws.on('close', () => {
          console.log('[PRINTER] 🔌 Desconectado do QZ Tray')
          this.isConnected = false
        })

        // Timeout de 5 segundos
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Timeout ao conectar'))
          }
        }, 5000)

      } catch (error) {
        console.error('[PRINTER] ❌ Erro ao conectar:', error.message)
        reject(error)
      }
    })
  }

  // Enviar mensagem para QZ Tray
  sendMessage(method, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.ws || !this.isConnected) {
        return reject(new Error('Não conectado ao QZ Tray'))
      }

      const uid = `msg_${++this.messageId}`
      const message = JSON.stringify({
        uid,
        call: method,
        params
      })

      // Assinar mensagem
      const signature = this.signMessage(message)

      // Enviar com assinatura
      const signedMessage = JSON.stringify({
        uid,
        call: method,
        params,
        signature
      })

      this.pendingMessages.set(uid, { resolve, reject })
      this.ws.send(signedMessage)

      // Timeout de 30 segundos
      setTimeout(() => {
        if (this.pendingMessages.has(uid)) {
          this.pendingMessages.delete(uid)
          reject(new Error('Timeout aguardando resposta'))
        }
      }, 30000)
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

      // Marcar como imprimindo
      await this.marcarComoImprimindo(item.id)

      // Buscar impressora padrão
      const printers = await this.sendMessage('getPrinters')
      const printerName = item.impressora_nome || (printers && printers[0])

      if (!printerName) {
        throw new Error('Nenhuma impressora encontrada')
      }

      console.log(`[PRINTER] 🖨️ Usando impressora: ${printerName}`)

      // Configurar impressora
      const config = {
        printer: printerName,
        options: {
          colorType: 'grayscale',
          orientation: 'landscape',
          rasterize: true,
          density: 203,
          margins: { top: 0, right: 0, bottom: 0, left: 0 },
          scaleContent: true
        }
      }

      // Imprimir etiqueta da criança
      if (item.html_crianca) {
        await this.sendMessage('print', [
          config.printer,
          [{
            type: 'html',
            format: 'plain',
            data: item.html_crianca
          }],
          config.options
        ])
        console.log(`[PRINTER] ✅ Etiqueta criança impressa`)
      }

      // Imprimir etiqueta do responsável (se houver)
      if (item.html_responsavel) {
        await this.sendMessage('print', [
          config.printer,
          [{
            type: 'html',
            format: 'plain',
            data: item.html_responsavel
          }],
          config.options
        ])
        console.log(`[PRINTER] ✅ Etiqueta responsável impressa`)
      }

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
      await axios.put(
        `${config.getApiUrl()}/api/fila-impressao/${id}`,
        { status: 'imprimindo' },
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
      await axios.put(
        `${config.getApiUrl()}/api/fila-impressao/${id}`,
        { 
          status: 'impresso',
          impresso_em: new Date().toISOString()
        },
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
      await axios.put(
        `${config.getApiUrl()}/api/fila-impressao/${id}`,
        { 
          status: 'erro',
          erro_mensagem: mensagemErro
        },
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
