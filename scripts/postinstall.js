import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const targetPath = path.join(projectRoot, 'sender.config.ts');

// Verificar se o arquivo já existe
if (fs.existsSync(targetPath)) {
  console.log('📄 sender.config.ts já existe. Pulando criação...');
  process.exit(0);
}

// Template do arquivo de configuração
const configTemplate = `import { defineConfig } from "@jcsulutions/sender";

export default defineConfig({
  // Provider padrão (opcional)
  defaultProvider: "ombala",
  
  providers: {
    // Configuração do Ombala
    ombala: {
      token: process.env.OMBALA_TOKEN,
      baseUrl: "https://api.useombala.ao/v1",
      from: "LEVAJA",  // obrigatório para Ombala
      timeout: 10000,
    },
    
    // Configuração do KambaSMS
    kambasms: {
      token: process.env.KAMBASMS_TOKEN,
      baseUrl: "https://api.kambasms.ao/v1",
      timeout: 10000,
      // data: { senderId: "MEUAPP" }  // opcional
    },
  },
});
`;

// Criar o arquivo
fs.writeFileSync(targetPath, configTemplate);
console.log('✅ Arquivo sender.config.ts criado com sucesso!');
console.log('📝 Configure suas credenciais no arquivo ou use variáveis de ambiente.');