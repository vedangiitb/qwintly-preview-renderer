// Tailwind generates CSS at build time by scanning source files for class names.
// In this app, many class names come from the fetched snapshot (runtime data),
// so they won't be detected automatically. We safelist common utility patterns
// so preview renders still get styled.
const withVariants = (inner: string) =>
  new RegExp(`^(?:[\\w-]+:)*${inner}$`);

const config = {
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
    { pattern: withVariants("(?:top|right|bottom|left)-(?:\\d+|\\[[^\\]]+\\])") },
    { pattern: withVariants("z-(?:\\d+|\\[[^\\]]+\\])") },

    // Sizing
    { pattern: withVariants("(?:w|h|min-w|min-h|max-w|max-h)-(?:\\d+|full|screen|min|max|fit|auto|\\[[^\\]]+\\])") },

    // Spacing
    { pattern: withVariants("-(?:m|mx|my|mt|mr|mb|ml|p|px|py|pt|pr|pb|pl)-(?:\\d+|\\[[^\\]]+\\])") },
    { pattern: withVariants("(?:m|mx|my|mt|mr|mb|ml|p|px|py|pt|pr|pb|pl)-(?:\\d+|\\[[^\\]]+\\])") },
    { pattern: withVariants("(?:gap|gap-x|gap-y|space-x|space-y)-(?:\\d+|\\[[^\\]]+\\])") },

    // Typography
    { pattern: withVariants("text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)") },
    { pattern: withVariants("font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)") },
    { pattern: withVariants("leading-(?:none|tight|snug|normal|relaxed|loose|\\d+|\\[[^\\]]+\\])") },
    { pattern: withVariants("tracking-(?:tighter|tight|normal|wide|wider|widest|\\[[^\\]]+\\])") },
    { pattern: withVariants("text-(?:left|center|right|justify)") },

    // Borders / radius / shadow
    { pattern: withVariants("rounded(?:-(?:none|sm|md|lg|xl|2xl|3xl|full))?") },
    { pattern: withVariants("border(?:-(?:0|2|4|8))?") },
    { pattern: withVariants("shadow(?:-(?:sm|md|lg|xl|2xl|inner|none))?") },

    // Colors (named scale + arbitrary values)
    { pattern: withVariants("(?:bg|text|border)-(?:transparent|current|black|white)") },
    { pattern: withVariants("(?:bg|text|border)-(?:[a-z]+)-(?:\\d{1,3})") },
    { pattern: withVariants("(?:bg|text|border)-\\[[^\\]]+\\]") },

    // Effects
    { pattern: withVariants("opacity-(?:\\d{1,3})") },
  ],
};

export default config;
