const axios = require('axios')
const config = require('./config')

class PrinterService {
  constructor() {
    this.qz = null
    this.isConnected = false
    this.isPrinting = false
    this.stats = {
      impressasHoje: 0,
      erros: 0
    }
  }

  // Conectar ao QZ Tray
  async connectQZ() {
    try {
      // QZ Tray deve estar rodando localmente
      // O script será carregado via CDN no HTML
      if (typeof qz === 'undefined') {
        throw new Error('QZ Tray não encontrado. Certifique-se de que está instalado e rodando.')
      }

      this.qz = qz

      if (!qz.websocket.isActive()) {
        await qz.websocket.connect()
      }

      this.isConnected = true
      console.log('[PRINTER] ✅ Conectado ao QZ Tray')
      return true
    } catch (error) {
      console.error('[PRINTER] ❌ Erro ao conectar QZ Tray:', error)
      this.isConnected = false
      return false
    }
  }

  // Buscar fila de impressão
  async buscarFila() {
    try {
      const token = config.getAuthToken()
      const organizacaoId = config.getOrganizacaoId()
      const apiUrl = config.getApiUrl()

      if (!token || !organizacaoId) {
        console.error('[PRINTER] ⚠️ Token ou organização não configurados')
        return []
      }

      const response = await axios.get(
        `${apiUrl}/api/fila-impressao?organizacao_id=${organizacaoId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success && response.data.items) {
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

      // Marcar como imprimindo na API
      await this.marcarComoImprimindo(item.id)

      // Configurar impressora
      const config = this.qz.configs.create(item.impressora_nome || 'default')

      // Imprimir etiqueta da criança
      if (item.html_crianca) {
        const dataCrianca = [{
          type: 'html',
          format: 'plain',
          data: item.html_crianca
        }]
        await this.qz.print(config, dataCrianca)
      }

      // Imprimir etiqueta do responsável (se houver)
      if (item.html_responsavel) {
        const dataResponsavel = [{
          type: 'html',
          format: 'plain',
          data: item.html_responsavel
        }]
        await this.qz.print(config, dataResponsavel)
      }

      // Marcar como impresso
      await this.marcarComoImpresso(item.id)
      
      this.stats.impressasHoje++
      console.log(`[PRINTER] ✅ Etiqueta impressa: ${item.crianca_nome}`)
      
      return true
    } catch (error) {
      console.error(`[PRINTER] ❌ Erro ao imprimir:`, error)
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
      const apiUrl = config.getApiUrl()

      await axios.post(
        `${apiUrl}/api/fila-impressao/imprimindo`,
        { id },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
    } catch (error) {
      console.error('[PRINTER] ⚠️ Erro ao marcar como imprimindo:', error.message)
    }
  }

  // Marcar como impresso
  async marcarComoImpresso(id) {
    try {
      const token = config.getAuthToken()
      const apiUrl = config.getApiUrl()

      await axios.post(
        `${apiUrl}/api/fila-impressao/impresso`,
        { id },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
    } catch (error) {
      console.error('[PRINTER] ⚠️ Erro ao marcar como impresso:', error.message)
    }
  }

  // Marcar como erro
  async marcarComoErro(id, mensagem) {
    try {
      const token = config.getAuthToken()
      const apiUrl = config.getApiUrl()

      await axios.post(
        `${apiUrl}/api/fila-impressao/erro`,
        { id, erro_mensagem: mensagem },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
    } catch (error) {
      console.error('[PRINTER] ⚠️ Erro ao marcar como erro:', error.message)
    }
  }

  // Obter estatísticas
  getStats() {
    return {
      ...this.stats,
      isConnected: this.isConnected,
      isPrinting: this.isPrinting
    }
  }
}

module.exports = new PrinterService()
