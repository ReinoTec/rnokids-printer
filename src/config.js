const Store = require('electron-store')

const store = new Store({
  name: 'rnokids-printer-config',
  defaults: {
    auth_token: null,
    organizacao_id: null,
    organizacao_nome: null,
    api_url: 'https://rnokids.com.br',
    polling_interval: 5000,
    auto_start: true
  }
})

module.exports = {
  get: (key) => store.get(key),
  set: (key, value) => store.set(key, value),
  getAll: () => store.store,
  clear: () => store.clear(),
  
  // Helpers
  isConfigured: () => {
    return !!(store.get('auth_token') && store.get('organizacao_id'))
  },
  
  getAuthToken: () => store.get('auth_token'),
  setAuthToken: (token) => store.set('auth_token', token),
  
  getOrganizacaoId: () => store.get('organizacao_id'),
  setOrganizacao: (id, nome) => {
    store.set('organizacao_id', id)
    store.set('organizacao_nome', nome)
  },
  
  getApiUrl: () => store.get('api_url'),
  getPollingInterval: () => store.get('polling_interval')
}
