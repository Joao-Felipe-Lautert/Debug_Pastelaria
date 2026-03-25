# 📱 Guia Completo de Build — Debug Pastelaria

## ✅ Pré-requisitos

```bash
# 1. Node.js 18+ e npm
node --version  # v18+
npm --version   # v9+

# 2. Instalar dependências (postinstall corrige permissões automaticamente)
npm install

# 3. Para EAS Build (APK na nuvem)
npm install -g eas-cli
eas login  # Criar conta em https://expo.dev
```

---

## 🚀 Opções de Build

### 1️⃣ Expo Go (Desenvolvimento Mobile)
```bash
npx expo start
# Escaneie o QR code com o app Expo Go no celular
```

**Funciona em:**
- ✅ iOS (via Expo Go)
- ✅ Android (via Expo Go)
- ✅ Web (via QR code)

---

### 2️⃣ Web (Desenvolvimento)
```bash
npx expo start --web
# Abre automaticamente em http://localhost:8081
```

**Ou build estático:**
```bash
npm run build:web
# Gera pasta `dist/` pronta para deploy
```

---

### 3️⃣ Android APK (Recomendado)

#### Opção A: Via EAS Build (Recomendado)
```bash
# Usar o script que corrige permissões automaticamente
npm run build:android

# Ou manualmente:
npm run prebuild:android
eas build -p android --profile preview
```

**Vantagens:**
- ✅ Compilação na nuvem (sem precisar de Android Studio)
- ✅ Sem problemas de permissões do hermesc
- ✅ APK pronto para instalar no celular

**Tempo:** ~10-15 minutos

#### Opção B: Local (Requer Android Studio)
```bash
npx expo run:android
# Precisa de emulador Android ou celular conectado
```

---

## 🔧 Troubleshooting

### ❌ Erro: `hermesc EACCES`
**Causa:** Permissões incorretas no compilador Hermes

**Solução:**
```bash
npm run prebuild:android
# Ou manualmente:
chmod +x node_modules/react-native/sdks/hermesc/linux64-bin/hermesc
```

---

### ❌ Erro: `window is not defined`
**Causa:** Supabase tentando usar AsyncStorage no web

**Solução:** Já está corrigida em `supabaseConfig.ts` — não fazer nada!

---

### ❌ Erro: `No environment variables found`
**Causa:** EAS Build aviso sobre variáveis de ambiente

**Solução:** Aviso apenas, não impede o build. Ignorar ou adicionar em `eas.json`:
```json
"env": {
  "EXPO_USE_FAST_RESOLVER": "1"
}
```

---

### ❌ Erro: `Metro bundler timeout`
**Causa:** Projeto muito grande ou máquina lenta

**Solução:**
```bash
# Limpar cache
npm run clean

# Ou manualmente
rm -rf node_modules/.cache
npx expo start -c
```

---

## 📊 Tamanhos de Build

| Plataforma | Tipo | Tamanho | Módulos |
|---|---|---|---|
| Web | SPA | 2.1 MB | 1.089 |
| Android | Hermes bytecode | 4.17 MB | 1.355 |
| APK final | Comprimido | ~50-80 MB | — |

---

## 🎯 Fluxo Recomendado

```bash
# 1. Desenvolvimento
npm install
npx expo start

# 2. Testes Web
npx expo start --web

# 3. Build Web
npm run build:web

# 4. Build Android APK
npm run build:android

# 5. Instalar APK no celular
# Baixar do link fornecido pelo EAS Build
# Ou via adb:
adb install app.apk
```

---

## 📝 Scripts Disponíveis

```bash
npm start              # Expo Go (mobile)
npm run web            # Web dev server
npm run android        # Android local (requer emulador)
npm run ios            # iOS local (requer macOS)
npm run build:web      # Build web estático
npm run build:android  # Build APK via EAS
npm run build:all      # Build web + prepara Android
npm run prebuild:android  # Apenas prepara ambiente
npm run lint           # ESLint
npm run clean          # Limpar cache Metro
npm run reset-project  # Reset do projeto
```

---

## 🌐 Deploy Web

```bash
# 1. Build
npm run build:web

# 2. Fazer upload da pasta `dist/` para:
# - Vercel: https://vercel.com
# - Netlify: https://netlify.com
# - GitHub Pages
# - Qualquer servidor web estático
```

---

## 📱 Instalar APK no Celular

### Via EAS Build:
1. Após `eas build -p android --profile preview`
2. Copiar o link do APK
3. Baixar no celular e instalar

### Via adb (Android Debug Bridge):
```bash
adb install app.apk
```

### Via arquivo direto:
1. Transferir `app.apk` para o celular
2. Abrir com gerenciador de arquivos
3. Tocar em "Instalar"

---

## ✨ Dicas Finais

- **Sempre** rodar `npm install` após clonar o projeto
- **Postinstall** corrige permissões automaticamente
- **EAS Build** é mais confiável que build local
- **Web** funciona em qualquer navegador moderno
- **Expo Go** é perfeito para testes rápidos
- **APK** é para distribuição final

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs: `npm run clean && npm install`
2. Verificar permissões: `npm run prebuild:android`
3. Verificar versões: `node --version && npm --version`
4. Limpar cache: `rm -rf node_modules && npm install`
5. Consultar: https://docs.expo.dev

---

**Projeto pronto para produção! 🚀**
