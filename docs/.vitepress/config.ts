import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Stimulus test utils',
  description: 'Zero-config, Testing-Library-flavoured test harness for Stimulus controllers.',
  base: '/stimulus-test-utils/',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,

  rewrites: {
    'v0.1.0/:path*': ':path*'
  },

  head: [
    ['meta', { name: 'theme-color', content: '#77216f' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Stimulus test utils' }],
    ['meta', {
      property: 'og:description',
      content: 'Zero-config, Testing-Library-flavoured test harness for Stimulus controllers.',
    }],
  ],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Cookbook', link: '/cookbook/' },
      { text: 'API', link: '/api/' },
      {
        text: 'v0.1.0',
        items: [
          { text: 'Changelog', link: 'https://github.com/tito10047/stimulus-test-utils/releases' },
        ],
      },
      {
        text: 'Links',
        items: [
          { text: 'GitHub', link: 'https://github.com/tito10047/stimulus-test-utils' },
          { text: 'npm', link: 'https://www.npmjs.com/package/@tito10047/stimulus-test-utils' },
          { text: 'Stimulus', link: 'https://stimulus.hotwired.dev' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Essentials',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Rendering controllers', link: '/guide/rendering' },
          ],
        },
        {
          text: 'Interacting with the DOM',
          items: [
            { text: 'Queries', link: '/guide/queries' },
            { text: 'User events', link: '/guide/user-events' },
            { text: 'Async assertions', link: '/guide/async' },
          ],
        },
        {
          text: 'Writing fixtures',
          items: [
            { text: 'Attribute helpers', link: '/guide/attribute-helpers' },
            { text: 'Multiple controllers & outlets', link: '/guide/multiple-controllers' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Cleanup & isolation', link: '/guide/cleanup-and-isolation' },
            { text: 'TypeScript', link: '/guide/typescript' },
            { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          ],
        },
        {
          text: 'Integrations',
          items: [
            { text: 'Symfony AssetMapper', link: '/guide/asset-mapper' },
          ],
        },
      ],
      '/cookbook/': [
        {
          text: 'Cookbook',
          items: [
            { text: 'Overview', link: '/cookbook/' },
            { text: 'Testing values', link: '/cookbook/values' },
            { text: 'Testing targets & classes', link: '/cookbook/targets-and-classes' },
            { text: 'Testing outlets', link: '/cookbook/outlets' },
            { text: 'Mocking fetch', link: '/cookbook/fetch' },
            { text: 'Fake timers', link: '/cookbook/timers' },
            { text: 'Form validation', link: '/cookbook/form-validation' },
            { text: 'Keyboard & a11y', link: '/cookbook/keyboard-and-a11y' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/tito10047/stimulus-test-utils' },
    ],

    search: { provider: 'local' },

    editLink: {
      pattern: 'https://github.com/tito10047/stimulus-test-utils/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 tito10047',
    },
  },
})
