#!/usr/bin/env node

/**
 * Script para corrigir permissões do hermesc após npm install
 * O hermesc é o compilador Hermes do React Native necessário para builds Android
 */

const fs = require('fs');
const path = require('path');

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
    console.log('✅ Permissões do hermesc corrigidas com sucesso!');
  } catch (error) {
    console.warn('⚠️ Não foi possível corrigir permissões do hermesc:', error.message);
  }
} else {
  console.log('ℹ️ hermesc não encontrado (pode estar em outro SO)');
}
