import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@jcsolutions/sender',
  description: 'SDK para envio de SMS com suporte a gateways angolanos',
  base: '/sender/', // para GitHub Pages
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
            { text: 'Básico', link: '/examples/basic/simple' }
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
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Justino-code/sender' }
    ],
    footer: {
      message: 'MIT License',
      copyright: 'Copyright © 2024 Justino Contingo'
    },
    search: {
      provider: 'local'
    }
  }
})