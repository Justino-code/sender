#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const projectRoot = path.resolve(__dirname, '..');
const targetPath = path.join(projectRoot, 'sender.config.ts');

// Verificação 1: Está sendo instalado no próprio projeto sender?
const isSelfInstall = fs.existsSync(path.join(projectRoot, 'src', 'core', 'provider.ts'));

if (isSelfInstall) {
  console.log('📦 @jcsolutions/sender: Detectada instalação no próprio projeto.');
  console.log('   Pulando criação automática do sender.config.ts\n');
  process.exit(0);
}

// Verificação 2: Está em ambiente de desenvolvimento?
const isDevEnv = process.env.NODE_ENV === 'development';

if (isDevEnv) {
  console.log('📦 @jcsolutions/sender: Ambiente de desenvolvimento detectado.');
  console.log('   Pulando criação automática do sender.config.ts\n');
  process.exit(0);
}

// Verificação 3: Arquivo já existe?
if (fs.existsSync(targetPath)) {
  console.log('📄 sender.config.ts já existe. Pulando criação...');
  process.exit(0);
}

// Verificação 4: Está em CI?
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

if (isCI) {
  console.log('📦 @jcsolutions/sender: Ambiente CI detectado.');
  console.log('   Pulando criação automática do sender.config.ts\n');
  process.exit(0);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n⚙️  Configuração opcional do @jcsolutions/sender\n');
console.log('Você pode criar um arquivo sender.config.ts para configurar');
console.log('seus providers de forma centralizada (opcional).');
console.log('Sem ele, você pode passar a configuração diretamente no createSender().\n');

rl.question('❓ Criar arquivo sender.config.ts? (y/N) ', (answer) => {
  rl.close();
  
  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'sim') {
    console.log('\n✅ Ok! Você pode criar o arquivo manualmente quando quiser.\n');
    process.exit(0);
  }

  const configTemplate = `import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  // Provider padrão (opcional)
  // defaultProvider: "ombala",
  
  providers: {
    // Configuração do Ombala
    ombala: {
      token: process.env.OMBALA_TOKEN,
      baseUrl: "https://api.useombala.ao/v1",
      from: "LEVAJA",
      timeout: 10000,
    },
    
    // Configuração do KambaSMS
    kambasms: {
      token: process.env.KAMBASMS_TOKEN,
      baseUrl: "https://api.kambasms.ao/v1",
      timeout: 10000,
    },
  },
});
`;
  
  fs.writeFileSync(targetPath, configTemplate);
  console.log('\n✅ Arquivo sender.config.ts criado com sucesso!\n');
});