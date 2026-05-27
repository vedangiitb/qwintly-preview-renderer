// Tailwind generates CSS at build time by scanning source files for class names.
// In this app, many class names come from the fetched snapshot (runtime data),
// so they won't be detected automatically. We safelist common utility patterns
// so preview renders still get styled.
const withVariants = (inner: string) =>
  new RegExp(String.raw`^(?:[\w-]+:)*${inner}$`);

const config = {
  // Force previews to render in "light" mode regardless of the user's OS/browser
  // preference. This disables `dark:` variants driven by `prefers-color-scheme`.
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./types/**/*.{js,ts,jsx,tsx,mdx}",
    "./services/**/*.{js,ts,jsx,tsx,mdx}",
    "./repository/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Layout / display
    { pattern: withVariants("(?:block|inline-block|inline|flex|inline-flex|grid|hidden)") },
    { pattern: withVariants("(?:flex-row|flex-col|flex-wrap|flex-nowrap)") },
    { pattern: withVariants("(?:items|content|justify)-(?:start|end|center|between|around|evenly|stretch|baseline)") },
    { pattern: withVariants("(?:relative|absolute|fixed|sticky)") },
    { pattern: withVariants(String.raw`(?:top|right|bottom|left)-(?:\d+|\[[^\]]+\])`) },
    { pattern: withVariants(String.raw`z-(?:\d+|\[[^\]]+\])`) },

    // Sizing
    { pattern: withVariants(String.raw`(?:w|h|min-w|min-h|max-w|max-h)-(?:\d+|full|screen|min|max|fit|auto|\[[^\]]+\])`) },

    // Spacing
    { pattern: withVariants(String.raw`-(?:m|mx|my|mt|mr|mb|ml|p|px|py|pt|pr|pb|pl)-(?:\d+|\[[^\]]+\])`) },
    { pattern: withVariants(String.raw`(?:m|mx|my|mt|mr|mb|ml|p|px|py|pt|pr|pb|pl)-(?:\d+|\[[^\]]+\])`) },
    { pattern: withVariants(String.raw`(?:gap|gap-x|gap-y|space-x|space-y)-(?:\d+|\[[^\]]+\])`) },

    // Typography
    { pattern: withVariants("text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)") },
    { pattern: withVariants("font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)") },
    { pattern: withVariants(String.raw`leading-(?:none|tight|snug|normal|relaxed|loose|\d+|\[[^\]]+\])`) },
    { pattern: withVariants(String.raw`tracking-(?:tighter|tight|normal|wide|wider|widest|\[[^\]]+\])`) },
    { pattern: withVariants("text-(?:left|center|right|justify)") },

    // Borders / radius / shadow
    { pattern: withVariants("rounded(?:-(?:none|sm|md|lg|xl|2xl|3xl|full))?") },
    { pattern: withVariants("border(?:-(?:0|2|4|8))?") },
    { pattern: withVariants("shadow(?:-(?:sm|md|lg|xl|2xl|inner|none))?") },

    // Colors (named scale + arbitrary values)
    { pattern: withVariants("(?:bg|text|border)-(?:transparent|current|black|white)") },
    { pattern: withVariants(String.raw`(?:bg|text|border)-(?:[a-z]+)-(?:\d{1,3})`) },
    { pattern: withVariants(String.raw`(?:bg|text|border)-\[[^\]]+\]`) },

    // Effects
    { pattern: withVariants(String.raw`opacity-(?:\d{1,3})`) },
  ],
};

export default config;
