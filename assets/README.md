# Ícones do Aplicativo

## Requisitos

Adicione os seguintes ícones nesta pasta:

### icon.png
- Tamanho: 512x512px
- Formato: PNG com transparência
- Uso: Ícone da bandeja do sistema e janelas

### icon.ico (Windows)
- Tamanho: 256x256px
- Formato: ICO
- Uso: Ícone do executável Windows

### icon.icns (macOS)
- Tamanho: 512x512px
- Formato: ICNS
- Uso: Ícone do app macOS

## Gerar Ícones

Você pode usar ferramentas online para converter PNG para ICO/ICNS:

- https://cloudconvert.com/png-to-ico
- https://cloudconvert.com/png-to-icns

Ou usar ferramentas de linha de comando:

```bash
# Instalar electron-icon-builder
npm install -g electron-icon-builder

# Gerar todos os ícones a partir de um PNG
electron-icon-builder --input=./icon-source.png --output=./assets
```

## Temporário

Enquanto não tiver um ícone personalizado, o app usará o ícone padrão do Electron.
