import { defineConfig } from 'vitepress'

const currentYear = new Date().getFullYear()

export default defineConfig({
  title: '@jcsolutions/sender',
  description: 'SDK para envio de SMS com suporte a gateways angolanos',
  base: '/sender/',
  
  themeConfig: {
    nav: [
      { text: 'Guia', link: '/getting-started' },
      { text: 'API', link: '/api' },
      { text: 'Exemplos', link: '/examples' },
      { text: 'Providers', link: '/providers' }
    ],
    
    sidebar: {
      '/': [
        {
          text: 'Começando',
          items: [
            { text: 'Introdução', link: '/' },
            { text: 'Primeiros passos', link: '/getting-started' },
            { text: 'Configuração', link: '/configuration' }
          ]
        },
        {
          text: 'API Reference',
          items: [
            { text: 'Funções principais', link: '/api/core' },
            { text: 'Interfaces', link: '/api/interfaces' },
            { text: 'Provider', link: '/api/provider' },
            { text: 'Tipos', link: '/api/types' },
            { text: 'Registry', link: '/api/registry' },
            { text: 'Config', link: '/api/config' },
            { text: 'Utilitários', link: '/api/utils' },
            { text: 'Erros', link: '/api/errors' }
          ]
        },
        {
          text: 'Exemplos',
          items: [
            { text: 'Visão geral', link: '/examples' },
            { text: 'Básico', link: '/examples/basic/simple' },
            { text: 'Envio em lote', link: '/examples/basic/batch' },
            { text: 'Tratamento de erros', link: '/examples/error-handling/full' },
            { text: 'Fallback', link: '/examples/fallback/automatic' },
            { text: 'Provider customizado', link: '/examples/advanced/custom-provider' },
            { text: 'Serviço Express', link: '/examples/advanced/express-service' },
            { text: 'Utilitário OTP', link: '/examples/utilities/otp' }
          ]
        },
        {
          text: 'Providers',
          items: [
            { text: 'Visão geral', link: '/providers' },
            { text: 'Ombala', link: '/providers/ombala' },
            { text: 'KambaSMS', link: '/providers/kambasms' }
          ]
        },
        {
          text: 'Customização',
          items: [
            { text: 'Provider customizado', link: '/custom-provider' }
          ]
        },
        {
          text: 'Informações',
          items: [
            { text: 'Versões', link: '/changelog' },
            { text: 'Contribuição', link: '/contributing' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Justino-code/sender' }
    ],
    
    footer: {
      message: 'MIT License',
      copyright: `Copyright © ${currentYear} Justino Contingo`
    },
    
    search: {
      provider: 'local'
    }
  }
})