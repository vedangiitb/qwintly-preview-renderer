import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const cssMockPlugin = {
  name: 'css-mock-plugin',
  enforce: 'pre' as const,
  resolveId(id: string) {
    if (id.endsWith('.css')) {
      return id;
    }
  },
  load(id: string) {
    if (id.endsWith('.css')) {
      return '';
    }
  }
};

export default defineConfig({
  plugins: [react(), cssMockPlugin],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    alias: {
      '@': path.resolve(process.cwd(), './'),
    },
    server: {
      deps: {
        inline: [
          'tailwindcss',
          '@csstools/css-calc',
          '@asamuzakjp/css-color',
          '@csstools/css-parser-algorithms',
          '@csstools/css-tokenizer',
          '@csstools/css-color-parser',
          '@csstools/color-helpers',
        ],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      all: true,
      include: [
        'app/**/*',
        'components/**/*',
        'lib/**/*',
        'services/**/*',
        'repository/**/*',
      ],
      exclude: [
        'app/globals.css',
        'types/**/*',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        'vitest.setup.ts',
      ],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  },
});
