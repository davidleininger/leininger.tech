const plugin = require('tailwindcss/plugin');
const postcss = require('postcss');
const postcssJs = require('postcss-js');

const clampGenerator = require('./utils/css/clamp-generator.js');
const tokensToTailwind = require('./utils/css/tokens-to-tailwind.js');

// Raw design tokens
const colorTokens = require('./utils/tokens/colors.json');
const fontTokens = require('./utils/tokens/fonts.json');
const spacingTokens = require('./utils/tokens/spacing.json');
const textSizeTokens = require('./utils/tokens/text-sizes.json');

// Process design tokens
const colors = tokensToTailwind(colorTokens.items);
const fontFamily = tokensToTailwind(fontTokens.items);
const fontSize = tokensToTailwind(clampGenerator(textSizeTokens.items));
const spacing = tokensToTailwind(clampGenerator(spacingTokens.items));

module.exports = {
  content: ['./src/**/*.{html,js,njk,vue}'],
  presets: [],
  theme: {
    colors,
    spacing,
    fontSize,
    fontFamily,
    fontWeight: {
      normal: 400,
      bold: 700,
      black: 800,
    },
    backgroundColor: ({theme}) => theme('colors'),
    textColor: ({theme}) => theme('colors'),
    margin: ({theme}) => ({
      auto: 'auto',
      ...theme('spacing'),
    }),
    padding: ({theme}) => theme('spacing'),
  },
  variantOrder: [
    'first',
    'last',
    'odd',
    'even',
    'visited',
    'checked',
    'empty',
    'read-only',
    'group-hover',
    'group-focus',
    'focus-within',
    'hover',
    'focus',
    'focus-visible',
    'active',
    'disabled',
  ],

  // Disables Tailwind's reset etc
  corePlugins: {
    preflight: false,
  },
  plugins: [
    // Generates custom property values from tailwind config
    plugin(function ({addComponents, config}) {
      let result = '';

      const currentConfig = config();

      const groups = [
        {key: 'colors', prefix: 'color'},
        {key: 'spacing', prefix: 'space'},
        {key: 'fontSize', prefix: 'text'},
        {key: 'fontFamily', prefix: 'font'},
      ];

      groups.forEach(({key, prefix}) => {
        const group = currentConfig.theme[key];

        if (!group) {
          return;
        }

        Object.keys(group).forEach(key => {
          result += `--${prefix}-${key}: ${group[key]};`;
        });
      });

      addComponents({
        ':root': postcssJs.objectify(postcss.parse(result)),
      });
    }),

    // Generates custom utility classes
    plugin(function ({addUtilities, config}) {
      const currentConfig = config();
      const customUtilities = [
        {key: 'spacing', prefix: 'flow-space', property: '--flow-space'},
        {key: 'colors', prefix: 'spot-color', property: '--spot-color'},
      ];

      customUtilities.forEach(({key, prefix, property}) => {
        const group = currentConfig.theme[key];

        if (!group) {
          return;
        }

        Object.keys(group).forEach(key => {
          addUtilities({
            [`.${prefix}-${key}`]: postcssJs.objectify(
              postcss.parse(`${property}: ${group[key]}`),
            ),
          });
        });
      });
    }),
  ],
};
