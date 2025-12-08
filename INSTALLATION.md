# Guia de Instalação - RNO Kids Printer

## 📋 Pré-requisitos

1. **QZ Tray** instalado e rodando
   - Download: https://qz.io/download/
   - Versão mínima: 2.2.5

2. **Token de autenticação** gerado no site
   - Acesse: https://rnokids.com.br/admin/impressao/download
   - Clique em "Gerar Token"

## 🪟 Windows

1. Baixe `RNOKids-Printer-Setup.exe`
2. Execute o instalador
3. Cole o token quando solicitado
4. O app iniciará automaticamente

**Localização:**
- Instalado em: `C:\Program Files\RNO Kids Printer`
- Atalho: Área de Trabalho + Menu Iniciar
- Auto-start: Sim (inicia com Windows)

## 🍎 macOS

1. Baixe `RNOKids-Printer.dmg`
2. Abra o arquivo e arraste para Applications
3. Execute o app
4. Cole o token quando solicitado

**Primeira execução:**
- macOS pode pedir permissão (Configurações → Segurança)
- Clique em "Abrir Mesmo Assim"

**Auto-start:**
- Sistema → Preferências → Usuários e Grupos → Itens de Login
- Adicione "RNO Kids Printer"

## 🐧 Linux

1. Baixe `RNOKids-Printer.AppImage`
2. Torne executável: `chmod +x RNOKids-Printer.AppImage`
3. Execute: `./RNOKids-Printer.AppImage`
4. Cole o token quando solicitado

**Auto-start (Ubuntu/Debian):**
```bash
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/rnokids-printer.desktop << EOF
[Desktop Entry]
Type=Application
Name=RNO Kids Printer
Exec=/caminho/para/RNOKids-Printer.AppImage
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOF
```

## 🔧 Configuração

### Primeira Configuração

1. Ao abrir o app pela primeira vez, você verá a tela de configuração
2. Cole o token gerado no site
3. Clique em "Salvar e Iniciar"
4. O app conectará automaticamente

### Reconfigurar

1. Clique com botão direito no ícone da bandeja
2. Selecione "Configurações"
3. Insira o novo token
4. Salve

## 🖨️ Uso

### Funcionamento Automático

- O app fica na bandeja do sistema (system tray)
- Conecta automaticamente ao QZ Tray
- Busca a fila de impressão a cada 5 segundos
- Imprime automaticamente quando há etiquetas

### Menu da Bandeja

- **Status**: Mostra se está conectado
- **Estatísticas**: Impressas hoje e erros
- **Reconectar**: Força reconexão
- **Configurações**: Alterar token
- **Sair**: Fechar aplicativo

## ❓ Solução de Problemas

### App não conecta ao QZ Tray

1. Verifique se o QZ Tray está rodando
2. Abra o QZ Tray manualmente
3. Clique em "Reconectar" no app

### Token inválido

1. Gere um novo token no site
2. Abra Configurações no app
3. Cole o novo token

### Não imprime automaticamente

1. Verifique se há itens na fila (site)
2. Verifique se a impressora está configurada
3. Veja os logs no console do app

### Ver Logs (Desenvolvimento)

```bash
# Windows
%APPDATA%\rnokids-printer\logs

# macOS
~/Library/Logs/rnokids-printer

# Linux
~/.config/rnokids-printer/logs
```

## 🔄 Atualização

### Automática (Futura)

O app verificará automaticamente por atualizações.

### Manual

1. Baixe a nova versão do site
2. Execute o instalador
3. A configuração será mantida

## 🗑️ Desinstalação

### Windows

- Painel de Controle → Programas → Desinstalar
- Ou: Configurações → Apps → RNO Kids Printer

### macOS

- Arraste o app da pasta Applications para Lixeira
- Remova dos Itens de Login

### Linux

- Delete o arquivo `.AppImage`
- Remova do autostart: `rm ~/.config/autostart/rnokids-printer.desktop`

## 📞 Suporte

- Site: https://rnokids.com.br
- Email: suporte@rnokids.com.br
- GitHub: https://github.com/seu-usuario/rnokids-printer/issues
