const axios = require('axios')
const config = require('./config')
const qz = require('qz-tray')

class PrinterService {
  constructor() {
    this.qz = qz
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
      // Configurar certificado (demo cert do QZ Tray)
      qz.security.setCertificatePromise(() => {
        return `-----BEGIN CERTIFICATE-----
MIIECzCCAvOgAwIBAgIGAZr/Wf0sMA0GCSqGSIb3DQEBCwUAMIGiMQswCQYDVQQG
EwJVUzELMAkGA1UECAwCTlkxEjAQBgNVBAcMCUNhbmFzdG90YTEbMBkGA1UECgwS
UVogSW5kdXN0cmllcywgTExDMRswGQYDVQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMx
HDAaBgkqhkiG9w0BCQEWDXN1cHBvcnRAcXouaW8xGjAYBgNVBAMMEVFaIFRyYXkg
RGVtbyBDZXJ0MB4XDTI1MTIwNzE5MDQzOFoXDTQ1MTIwNzE5MDQzOFowgaIxCzAJ
BgNVBAYTAlVTMQswCQYDVQQIDAJOWTESMBAGA1UEBwwJQ2FuYXN0b3RhMRswGQYD
VQQKDBJRWiBJbmR1c3RyaWVzLCBMTEMxGzAZBgNVBAsMElFaIEluZHVzdHJpZXMs
IExMQzEcMBoGCSqGSIb3DQEJARYNc3VwcG9ydEBxei5pbzEaMBgGA1UEAwwRUVog
VHJheSBEZW1vIENlcnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCw
C55ab940XQ0W0ENEh+byKtSVOaeYUW3yZbPBOakBuV7ctMdrYUyEM3UVChX15aF7
TbqMeIzdMkLrdqZBvutpT3zWiRCXDvkpZypKi6gkSMmTtMy8f9+buzL4VxLE8PoK
qGNzfOaI46nEcdZtCr2wy3sa+nE7wpobLyXapFApoXpacqzBiL4ZBMwFJf9FJw00
GYmPEGEVgpGgS3lAahD03eC4cS0D5ndKPR0aXGXHRJ6NTY3nXpMR/20Bmw+RKafv
/T4/7m6x/RGNUJV98Z5cTqob0ObLT0LY79ErgbR0zsQYOcctfSixM26N2eomFHPV
En6GuGEcOmnfNWMNpLCDAgMBAAGjRTBDMBIGA1UdEwEB/wQIMAYBAf8CAQEwDgYD
VR0PAQH/BAQDAgEGMB0GA1UdDgQWBBSvwhRMx5tOGytyyDeuHc9NJ00QhDANBgkq
hkiG9w0BAQsFAAOCAQEAXsveTdQVIcwXG5c1AGeb8y7DWy7XhmE0wXmC5MybGUQu
mAe+yuizq5J5j5ANUjm//TfJcx6M1JVRgPjyOny5RO312am5ErXszcbCDazKww1j
mVndJBK+kSJYUsK6yHE3w8gHg6ArTZAqLql+q2fxOAtCohrmI9qXHWEO0tpsV9cV
bKib4fIGoYFmf1vtAwXs5Y74H4NlAJ2+2ltQDoydZokgWtWQ2IzK24oOAKbDXK2G
h4nBl/FkW7YF8IoJmBhH06yUB7kk5090cn+gk7wfDKJXOlkMyc/VJFwDiy3VdwgX
ltJPsg8KO/Htvsj1kzf6I5m0FBiAjaZvfYUOxl3dxg==
-----END CERTIFICATE-----`
      })

      qz.security.setSignatureAlgorithm('SHA512')
      qz.security.setSignaturePromise((toSign) => {
        return (resolve) => {
          // Assinar com a chave privada
          const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCwC55ab940XQ0W
0ENEh+byKtSVOaeYUW3yZbPBOakBuV7ctMdrYUyEM3UVChX15aF7TbqMeIzdMkLr
dqZBvutpT3zWiRCXDvkpZypKi6gkSMmTtMy8f9+buzL4VxLE8PoKqGNzfOaI46nE
cdZtCr2wy3sa+nE7wpobLyXapFApoXpacqzBiL4ZBMwFJf9FJw00GYmPEGEVgpGg
S3lAahD03eC4cS0D5ndKPR0aXGXHRJ6NTY3nXpMR/20Bmw+RKafv/T4/7m6x/RGN
UJV98Z5cTqob0ObLT0LY79ErgbR0zsQYOcctfSixM26N2eomFHPVEn6GuGEcOmnf
NWMNpLCDAgMBAAECggEAGwrbMIg7qW6GdV6DiXJDjdKkz3weRwhx1l48uRiq4gAV
gYYRlhNJsOBuAqUxz2aOojAZURJZjRxMlE/9ul63Wc4jM+9fyYc8IK80xg5i7e6d
FwqbDUpVUTOgi5kQjIkkgmDwefaR5oLrpVNZUsG8zCd4XyILz9gVBR+pIHIaJZ1j
hmy/gHOXiWg9J965Kci76HhPXsEX3/mfmwCNT22i/KppfaMIaMjOAOFD3jncYm/U
kE4waE66mXNn/ChqzfOGYSFcsM/YXX9TBXIIOYJ+EyHWbR7j8Mj3AftYfH8QkbJP
CsZdrLSEidPJZKv0Q0bWgo0dwkLj6l36MB3jkf/2DQKBgQDnNkwP2R2A75Jv/4QC
dguLZjz0KdIRnkWJY9PoI6ZP7NosPRrxe8HnMbXAaKbRCShysdWObms6AMXD80kA
lJWI11dzUfup2Ts6ineqDjg1hY23j0dPkYcHyvRVH89VK6As2Vg8ewYGgoNVke2B
F5Ht+AIxb6S7KBGnNXDMYp+ChQKBgQDC60AS2y0nYKjCZ9oVYK8K2YHFgGyFPQKD
Z1DEQ4HlAYUWy0gKuIq3pXAWizDiaJYP2zZWrGuIbch8MFA6hUGkVTa+Yly+ryMx
8pNWOaxXTExU9xyWPxhTQY+NFleB/XYP3e4n7I/ciSXypo6q0+JvP0BHNNZ8jX3W
LXwoPYaJZwKBgDjNwTAfkj0MHrj/WIpWQA3WZ2FBKQgFD2ZqrTQaFhEKyqsVtBnh
4siPEO0diOZQTqym/iWJATT13aB/k87dskM1TJnbaW3YHdILFM0lwy97CU8wlz94
LGmAtjh3oTN2jVqXZzMsslVFGUkbmfMePE7voHJO0HTeqj+fRIAiNrgVAoGBAIJH
8z+nN3sGZEXsXBvFz7mUv+RefipgKPnjaFyGMp/6cBZYMQLZbf5pmY234yixdvuK
Lbuo6wb5OfOn5zf2MXXBbyG5ZPwe24ta85fCXKrM2IhB0t2ptnyPaX+H212LKApa
7//HYjCpiq+xG9KaZNKumCv/6Qy/Fci+BipvVSkpAoGBANEgyewYIh+5Gfjhmnx6
rTUJzgMTCndUqH1VoXKqsY/t004YXi7/2YFWrmRXhm7OdK6AZvmY2bZa/lZ/Q3Eb
MPblkAAnN2b7NQkrW4gpOEREaT6uxPzKdcP3abVQqAhQL2DHzhH8+QguNxKf4wpY
YSiLoonL0DeGRXu4GKFP6TwU
-----END PRIVATE KEY-----`
          
          const crypto = require('crypto')
          const sign = crypto.createSign('sha512')
          sign.update(toSign)
          resolve(sign.sign(privateKey, 'base64'))
        }
      })

      // Conectar ao QZ Tray
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect()
      }
      
      this.isConnected = true
      console.log('[PRINTER] ✅ Conectado ao QZ Tray')
      return true
    } catch (error) {
      console.error('[PRINTER] ❌ Erro ao conectar QZ Tray:', error.message)
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
    if (this.isPrinting || !this.isConnected) {
      return false
    }

    this.isPrinting = true

    try {
      console.log(`[PRINTER] 🖨️ Imprimindo: ${item.crianca_nome}`)

      // Marcar como imprimindo
      await this.marcarComoImprimindo(item.id)

      // Configurar impressora (usar padrão se não especificado)
      const printerName = item.impressora_nome || await qz.printers.getDefault()
      const printerConfig = qz.configs.create(printerName, {
        colorType: 'grayscale',
        orientation: 'landscape',
        rasterize: true,
        density: 203,
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
        scaleContent: true
      })

      // Imprimir etiqueta da criança
      if (item.html_crianca) {
        const dataCrianca = [{
          type: 'html',
          format: 'plain',
          data: item.html_crianca
        }]
        await qz.print(printerConfig, dataCrianca)
        console.log(`[PRINTER] ✅ Etiqueta criança impressa`)
      }

      // Imprimir etiqueta do responsável (se houver)
      if (item.html_responsavel) {
        const dataResponsavel = [{
          type: 'html',
          format: 'plain',
          data: item.html_responsavel
        }]
        await qz.print(printerConfig, dataResponsavel)
        console.log(`[PRINTER] ✅ Etiqueta responsável impressa`)
      }

      // Marcar como impresso
      await this.marcarComoImpresso(item.id)
      
      this.stats.impressasHoje++
      console.log(`[PRINTER] ✅ Etiqueta completa: ${item.crianca_nome}`)
      
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
