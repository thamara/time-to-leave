# Website Time to Leave 
 
Check [issue #468](https://github.com/thamara/time-to-leave/issues/468) for information. 
Check [issue #583](https://github.com/thamara/time-to-leave/issues/583) for figma design. 


## Building and running on localhost

Bundler [Parcel.js](https://parceljs.org/) has been used for the compilation.

First install dependencies:

```sh
npm install
```

To run in hot module reloading mode:

```sh
npm start
```

## Running

```sh
node dist/bundle.js
```

## Deploy

To create a production build:

```sh
npm run build-prod
```

This disables watch mode and hot module replacement so it will only build once. It also enables the minifier for all output bundles to reduce file size. The minifiers used by Parcel are terser for JavaScript, cssnano for CSS, and htmlnano for HTML.

