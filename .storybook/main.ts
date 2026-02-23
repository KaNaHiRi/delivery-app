import type { StorybookConfig } from '@storybook/nextjs-vite';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM環境での__dirname代替
// C#でいうAppDomain.CurrentDomain.BaseDirectoryに相当
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
  stories: [
    '../app/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['..\\public'],
  viteFinal: async (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      'next-intl': path.resolve(__dirname, './next-intl-mock.ts'),
      'next-intl/client': path.resolve(__dirname, './next-intl-mock.ts'),
      'next-intl/server': path.resolve(__dirname, './next-intl-mock.ts'),
    };
    return config;
  },
};

export default config;