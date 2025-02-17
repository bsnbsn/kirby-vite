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
npm install vite vite-plugin-kirby
```

### Development VS Production modes

In development, files are loaded from Vite's dev server. In production, files are injected based on the `manifest.json` file generated by Vite.

kirby-vite uses a file named `.dev` (created and removed automatically by vite-plugin-kirby) to determine which mode to use:

- when the file exists, it will run in development mode
- when the file doesn’t exists, it will run in production mode

### Config

All configuration is done in the `vite.config.js`:

```js
// vite.config.js
import kirby from 'vite-plugin-kirby'

export default {
  build: {
    // Where your manifest an bundled assets will be placed. This example
    // assumes you use a public folder structure.
    outDir: 'public/dist',
    assetsDir: 'assets'

    // Your entry file(s).
    // Note: CSS files can either be a separate entry. In this case you use it
    // like this: `<?= vite->css('main.css') ?>`. Or you can only add the
    // `main.js` as an entry and import the CSS in your JS file. In this case
    // you would use the JS file name: `vite()->css('main.js')`.
    rollupOptions: {
      input: ['main.js', 'main.css']
    }
  }

  plugins: [kirby({
    // By default Kirby's templates, snippets, controllers, models, layouts and
    // everything inside the content folder will be watched and a full reload
    // triggered. All paths are relative to Vite's root folder.
    watch: [
      '../site/(templates|snippets|controllers|models|layouts)/**/*.php',
      '../content/**/*',
    ]
    // or disable watching
    watch: false,

    // Where the automatically generated `vite.config.php` file should be
    // placed. This has to match Kirby's config folder!
    kirbyConfigDir: 'site/config' // default
  })],
}
```

`vite-plugin-kirby` shares part of this config with Kirby, by dynamically creating a `site/config/vite.config.php` file.

## Asset file paths

Sometimes you might want to access the (hashed) file path of your assets, e.g. to preload fonts. You can do so with `vite()->file()`:

```php
 <link rel="preload" href="<?= vite()->file('my-font.woff2') ?>" as="font" type="font/woff2" crossorigin>
```

## Trying

If you try to load a non-existent manifest entry, this plugin will throw an error (if Kirby's `debug` option is enabled). This is intended behaviour, since you usually know which entries exist. But sometimes, especially in a multi-page setup, you may want to try to load an entry only if it exists. You can do this with the `try` flag:

```php
vite()->js('templates/' . $page->template() . '/index.js', try: true);
vite()->css('templates/' . $page->template() . '/index.css', try: true);
vite()->file('maybe.woff2', try: true);
```

## Legacy build

Since version `2.4.0` you can easily support legacy browsers that do not support native ESM.
Just add the [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) plugin to your `vite.config.js`:

```js
import legacy from '@vitejs/plugin-legacy'

// vite.config.js
export default {
  // ...
  plugins: [
    // ...
    legacy(),
  ],
}
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

### Known issue

`@vitejs/plugin-legacy` will inline the css in the legacy js entry. So users with a legacy browser will download the css twice. [See this issue](https://github.com/vitejs/vite/issues/2062).

## Credits

This plugin is highly inspired by [Diverently](https://github.com/Diverently)'s [Laravel Mix Helper for Kirby](https://github.com/Diverently/laravel-mix-kirby) and [André Felipe](https://github.com/andrefelipe)'s [vite-php-setup](https://github.com/andrefelipe/vite-php-setup). Many of the fine tunings I owe to [Johann Schopplich](https://github.com/johannschopplich) and his [Kirby + Vue 3 Starterkit](https://github.com/johannschopplich/kirby-vue3-starterkit).
