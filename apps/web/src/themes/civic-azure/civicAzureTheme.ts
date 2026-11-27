import { defineTheme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral';
import { palette } from './tokens/civicAzure.palette';

const { light, dark } = palette.civic;

export const civicAzureTheme = defineTheme({
  name: 'civic-azure',

  extends: neutralTheme,

  typography: {
    body: {
      family: 'system-ui',
      fallbacks: 'sans-serif',
    },
  },

  color: {
    accent: [light['45'], dark['70']],
    neutralStyle: 'cool',
    contrast: 'standard',
  },

  tokens: {
    '--font-family-body': 'var(--font-inter)',
    '--font-family-heading': 'var(--font-inter)',
    '--color-background-body': [
      '#F8FAFC',
      '#0F172A',
    ],

    '--color-background-surface': [
      '#FFFFFF',
      '#1E293B',
    ],

    '--color-background-card': [
      '#FFFFFF',
      '#1E293B',
    ],

    '--color-background-popover': [
      '#FFFFFF',
      '#1E293B',
    ],

    '--color-text-primary': [
      '#0F172A',
      '#F8FAFC',
    ],

    '--color-text-secondary': [
      '#475569',
      '#CBD5E1',
    ],

    '--color-border': [
      '#E2E8F0',
      '#334155',
    ],
  },
});
