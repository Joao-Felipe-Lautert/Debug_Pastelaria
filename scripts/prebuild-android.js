#!/usr/bin/env node

/**
 * Script de pré-build para Android
 * Corrige permissões do hermesc e prepara o ambiente para EAS Build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Preparando ambiente para Android build...\n');

// 1. Corrigir permissões do hermesc
const hermescPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native',
  'sdks',
  'hermesc',
  'linux64-bin',
  'hermesc'
);

if (fs.existsSync(hermescPath)) {
  try {
    fs.chmodSync(hermescPath, 0o755);
    console.log('✅ Permissões do hermesc corrigidas');
  } catch (error) {
    console.warn('⚠️ Aviso ao corrigir hermesc:', error.message);
  }
} else {
  console.log('ℹ️ hermesc não encontrado (pode estar em outro SO)');
}

// 2. Corrigir permissões do gradlew
const gradlewPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native',
  'android',
  'gradlew'
);

if (fs.existsSync(gradlewPath)) {
  try {
    fs.chmodSync(gradlewPath, 0o755);
    console.log('✅ Permissões do gradlew corrigidas');
  } catch (error) {
    console.warn('⚠️ Aviso ao corrigir gradlew:', error.message);
  }
}

// 3. Verificar se o app.json tem o projectId
try {
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  if (appJson.expo?.extra?.eas?.projectId) {
    console.log('✅ projectId encontrado:', appJson.expo.extra.eas.projectId);
  } else {
    console.warn('⚠️ projectId não encontrado em app.json');
  }
} catch (error) {
  console.warn('⚠️ Erro ao verificar app.json:', error.message);
}

console.log('\n✅ Preparação concluída!\n');
