# RNO Kids Printer

Aplicativo desktop para impressão automática de etiquetas em background.

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

## Build

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux

# Todos
npm run build:all
```

## Estrutura

```
rnokids-printer/
├── src/
│   ├── main.js          # Processo principal do Electron
│   ├── printer.js       # Lógica de impressão
│   └── config.js        # Gerenciamento de configuração
├── assets/
│   └── icon.png         # Ícone do app
└── package.json
```

## Como Funciona

1. Usuário baixa o instalador do site (com token embutido)
2. App inicia automaticamente com o Windows
3. Fica na bandeja do sistema
4. Faz polling da API a cada 5 segundos
5. Imprime automaticamente quando há etiquetas na fila
# rnokids-printer
