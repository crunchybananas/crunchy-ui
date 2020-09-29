'use strict';
const staticPostcssAddonTree = require('static-postcss-addon-tree');
const funnel = require('broccoli-funnel');
const { join } = require('path');

const CssImport = require('postcss-import');
const PresetEnv = require('postcss-preset-env');
const Tailwind = require("tailwindcss");

module.exports = {
  name: require('./package').name,
  isDevelopingAddon() {
    return true;
  },
  options: {
    svgJar: {
      sourceDirs: [
        'public/images/icons',
        'node_modules/crunchy-ui/public/images/icons',
        'tests/dummy/public/images/icons'
      ]
    },
  },

  included(app, parentAddon) {
    let target = parentAddon || app;

    if (target.app) {
      target = target.app;
    }

    this.app = target;
    this.addonConfig = this.app.project.config(app.env)['crunchy-ui'] || {};

    this._super.included.apply(this, arguments);
  },

  treeForAddon() {
    const tree = this._super(...arguments);

    // Create addon tree without any styles
    const addonWithoutStyles = funnel(tree, {
      exclude: ['**/*.css'],
    });

    // Check config to see if we should exclude styles from tree
    if (this._shouldExcludeStyles()) {
      return addonWithoutStyles;
    }

    return staticPostcssAddonTree(tree, {
      addonName: 'crunchy-ui',
      addonFolder: __dirname,
      project: this.app.project,
      postCssPlugins: [
        CssImport({
          path: join(__dirname, 'addon', 'styles')
        }),
        new Tailwind(join(__dirname, 'config', 'tailwind.config.js')),
        PresetEnv({
          stage: 3,
          features: { 'nesting-rules': true }
        })
      ]
    });
  },

  _shouldExcludeStyles() {
    return this.addonConfig['excludeStyles'] === true;
  }

};
