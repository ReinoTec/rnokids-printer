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
      // Verificar se QZ Tray está rodando fazendo uma requisição HTTP
      const response = await axios.get('http://localhost:8182/', {
        timeout: 2000
      })
      
      if (response.status === 200) {
        this.isConnected = true
        console.log('[PRINTER] ✅ QZ Tray detectado e rodando')
        return true
      }
      
      throw new Error('QZ Tray não respondeu')
    } catch (error) {
      console.error('[PRINTER] ❌ QZ Tray não está rodando:', error.message)
      console.error('[PRINTER] 💡 Certifique-se de que o QZ Tray está instalado e rodando')
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
    if (this.isPrinting) {
      return false
    }

    this.isPrinting = true

    try {
      console.log(`[PRINTER] 🖨️ Processando: ${item.crianca_nome}`)

      // Por enquanto, apenas marcar como impresso
      // A impressão real acontece via navegador no site
      // TODO: Implementar impressão direta via QZ Tray quando necessário
      
      await this.marcarComoImpresso(item.id)
      
      this.stats.impressasHoje++
      console.log(`[PRINTER] ✅ Marcado como impresso: ${item.crianca_nome}`)
      console.log(`[PRINTER] 💡 Abra ${config.getApiUrl()}/admin/impressao para imprimir`)
      
      return true
    } catch (error) {
      console.error(`[PRINTER] ❌ Erro:`, error)
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
