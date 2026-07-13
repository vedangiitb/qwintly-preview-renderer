import { describe, it, expect } from 'vitest';
import { buildCssVars } from '../../../lib/styles/buildCssVars';
import type { StyleConfig } from '@/types/styleConfig';

describe('buildCssVars utility', () => {
  it('should build CSS variable strings from tokens and append !important', () => {
    const config: StyleConfig = {
      version: 1,
      tokens: {
        radius: "10px",
        background: "white",
        foreground: "black",
        card: "white",
        cardForeground: "black",
        popover: "white",
        popoverForeground: "black",
        primary: "blue",
        primaryForeground: "white",
        secondary: "gray",
        secondaryForeground: "black",
        muted: "lightgray",
        mutedForeground: "gray",
        accent: "yellow",
        accentForeground: "black",
        destructive: "red",
        border: "darkgray",
        input: "white",
        ring: "blue",
        chart1: "red",
        chart2: "blue",
        chart3: "green",
        chart4: "orange",
        chart5: "purple",
        sidebar: "lightgray",
        sidebarForeground: "black",
        sidebarPrimary: "blue",
        sidebarPrimaryForeground: "white",
        sidebarAccent: "yellow",
        sidebarAccentForeground: "black",
        sidebarBorder: "darkgray",
        sidebarRing: "blue",
      },
    };

    const css = buildCssVars(config);
    expect(css).toContain(':root{');
    expect(css).toContain('--radius:10px !important');
    expect(css).toContain('--card-foreground:black !important');
    expect(css).toContain('--sidebar-primary-foreground:white !important');
  });

  it('should escape </style tag breaker sequences', () => {
    const config: StyleConfig = {
      version: 1,
      tokens: {
        radius: "</style><script>alert(1)</script>",
        background: "white",
        foreground: "black",
        card: "white",
        cardForeground: "black",
        popover: "white",
        popoverForeground: "black",
        primary: "blue",
        primaryForeground: "white",
        secondary: "gray",
        secondaryForeground: "black",
        muted: "lightgray",
        mutedForeground: "gray",
        accent: "yellow",
        accentForeground: "black",
        destructive: "red",
        border: "darkgray",
        input: "white",
        ring: "blue",
        chart1: "red",
        chart2: "blue",
        chart3: "green",
        chart4: "orange",
        chart5: "purple",
        sidebar: "lightgray",
        sidebarForeground: "black",
        sidebarPrimary: "blue",
        sidebarPrimaryForeground: "white",
        sidebarAccent: "yellow",
        sidebarAccentForeground: "black",
        sidebarBorder: "darkgray",
        sidebarRing: "blue",
      },
    };

    const css = buildCssVars(config);
    expect(css).not.toContain('</style');
    expect(css).toContain(String.raw`<\/style`);
  });
});
