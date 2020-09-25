module.exports = {
  prefix: 'cb-',
  purge: {
    enabled: true,
    preserveHtmlElements: false,
    content: [
      './node_modules/crunchy-ui/addon/**/*.hbs',
      './node_modules/crunchy-ui/addon/**/*.js',
      './node_modules/crunchy-ui/app/**/*.hbs',
      './node_modules/crunchy-ui/app/**/*.js',
    ],
  },
  theme: {},
  variants: {},
  plugins: [],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
}
