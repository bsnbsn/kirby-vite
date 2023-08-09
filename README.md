<p align="center">
  <img src="https://user-images.githubusercontent.com/15122993/230586295-c0341d08-88dc-4107-874d-91fcbf6bc4ce.svg"
 alt="Kirby Vite Plugin" width="128" height="128">
</p>

<h1 align="center">Kirby Vite Plugin</h1>

A set of helper functions to get the correct path to your versioned css and js files generated by [Vite](https://github.com/vitejs/vite).

## Use-cases

You can use kirby-vite for a single or multi-page vanilla js setup or as a basis for an SPA setup. If you plan to use `Kirby` together with `Vue 3` also checkout [Johann Schopplich](https://github.com/johannschopplich)'s [Kirby + Vue 3 Starterkit](https://github.com/johannschopplich/kirby-vue3-starterkit)!

## Getting started

The easiest way to get started is using the [basic starter kit](https://github.com/arnoson/kirby-vite-basic-kit) or the [multi-page kit](https://github.com/arnoson/kirby-vite-multi-page-kit).

## Usage

Make sure you have the right [setup](#setup).
Then inside your template files (or anywhere else) you can use the helper functions.

```php
<html>
  <head>
    <?= vite()->css('index.css') ?>
  </head>
  <body>
    <?= vite()->js('index.js') ?>
  </body>
</html>
```

## Setup

If you want use the plugin without one of the starter kits, you can add it to your existing kirby setup.

### Installation

```
composer require arnoson/kirby-vite
```

```
npm install vite-plugin-kirby
```

### Folder structure

Make sure you use a modern [public folder structure](https://getkirby.com/docs/guide/configuration#custom-folder-setup__public-folder-setup).

### Development VS Production modes

In development, files are loaded from Vite's dev server. In production, files are injected based on the `manifest.json` file generated by Vite.

kirby-vite uses a file named `.dev` (created automatically by vite-plugin-kirby) to determine which mode to use:

- when the file exists, it will run in development mode
- when the file doesn’t exists, it will run in production mode

```js
import kirby from 'vite-plugin-kirby'

// vite.config.js
export default {
  // ...
  plugins: [kirby()]
}
```

See `vite.config.js` for a complete example.

## Options

```php
'arnoson.kirby-vite' => [
  // The default entry that is used when calling `vite()->js()`
  // Note: this has to match Vite config's `build.rollupOptions.input`
  'entry' => 'index.js',

  // Wether or not to output legacy bundles automatically (see: Legacy build)
  'legacy' => false,

  // The output directory for the production assets (js, css, fonts, ...)
  // Note: this has to match Vite config's `base` and `build.outDir`
  'outDir' => 'dist',

  // Wether or not to use modern es modules
  // Note: if you want to support older browsers you can still enabled es
  // modules but enabled the `legacy` option
  'module' => true
]
```

## Legacy build

Since version `2.4.0` you can easily support legacy browsers that do not support native ESM.
Therefore add the [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) plugin to your project and enable the legacy option in your `config.php`:

```php
'arnoson.kirby-vite.legacy' => true
```

Now call kirby-vite's `js()` helper as usual.

```php
<!-- your template -->
<?= vite()->js('index.js') ?>
```

which will render:

```html
<script
  src="https://your-website.org/dist/assets/polyfills-legacy.[hash].js"
  nomodule=""
></script>
<script
  src="https://your-website.org/dist/assets/index-legacy.[hash].js"
  nomodule=""
></script>
<script
  src="https://your-website.org/dist/assets/index.[hash].js"
  type="module"
></script>
```

If you want to have more control over where the legacy files are rendered, disable `arnoson.kirby-vite.legacy` and use Kirby-Vite's legacy helpers manually:

```php
<?= vite()->legacyPolyfills() ?>
<?= vite()->legacyJs('index.js') ?>
<?= vite()->js('index.js') ?>
```

## Asset file paths

Sometimes you might want to access the (hashed) file path of your assets, e.g. to preload fonts. You can do so with `vite()->file()`:

```php
 <link rel="preload" href="<?= vite()->file('my-font.woff2') ?>" as="font" type="font/woff2" crossorigin>
```

### Known issue

`@vitejs/plugin-legacy` will inline the css in the legacy js entry. So users with a legacy browser will download the css twice. [See this issue](https://github.com/vitejs/vite/issues/2062).

## Watch files

vite-plugin-kirby automatically uses vite-plugin-live-reload to watch the following paths:
- `site/(templates|snippets|controllers|models|layouts)/**/*.php`
- `content/**/*`

To disable file watching or define your own paths, [configure](https://github.com/arnoson/vite-plugin-kirby#watch-files) vite-plugin-kirby.

## Credits

This plugin is highly inspired by [Diverently](https://github.com/Diverently)'s [Laravel Mix Helper for Kirby](https://github.com/Diverently/laravel-mix-kirby) and [André Felipe](https://github.com/andrefelipe)'s [vite-php-setup](https://github.com/andrefelipe/vite-php-setup). Many of the fine tunings I owe to [Johann Schopplich](https://github.com/johannschopplich) and his [Kirby + Vue 3 Starterkit](https://github.com/johannschopplich/kirby-vue3-starterkit).
