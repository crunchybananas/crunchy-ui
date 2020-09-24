module.exports = {
  prefix: 'cb-',
  purge: {
    enabled: true,
    content: [
      './addon/**/*.hbs',
      './addon/**/*.js',
      './app/**/*.hbs',
      './app/**/*.js'
    ]
  },
  theme: {},
  variants: {},
  plugins: [],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
}
