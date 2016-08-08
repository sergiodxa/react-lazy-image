# react-lazy-image
Component to render images and lazyload them if are in the viewport (or near to them).

This component extends from `React.PureComponent` so it needs React.js v15.3.0 or superior.

## Installation
```bash
npm i -S react-lazy-image
```

## Usage example
```jsx
import Image from 'react-lazy-image';

const image = <Image source="https://placekitten.com/200/300" />;
```

## API

### `onLayout({ element: Object }): void`
Called everytime the component is rendered or updated. Default: `() => {}`.

### `onError({ element: Object, error: Error }): void`
Called if the request to load the image failed. Default: `() => {}`.

### `onLoad({ element: Object }): void`
Called after the load ended (either successfully or not). Default: `() => {}`.

### `onLoadEnd({ element: Object }): void`
Called after the load ended successfully. Default: `() => {}`.

### `onLoadStart({ element: Object }): void`
Called when the request started. Default: `() => {}`.

### `onAbort({ element: Object }): void`
Called if the load of the image was aborted. Default: `() => {}`.

### `onProgress({ element: Object }): void`
Called everytime the AJAX progress event is dispatched. Default: `() => {}`.

### `offset: ?number`
Set the amount of pixel near the viewport the component should be to start the image load. Default: `0`.

### `source: string`
The image source path to load.

### `defaultSource: ?string`
The default image source path or base64. If isn't defined then it uses a SVG animated spinner.

### `type: ?string`
The format type of the image (`png`, `svg+xml`, `jpg` or `gif`). Default: `*`.

### `minLoaded: ?number`
The minimum download percentaje to avoid aborting the request if the image leaves the viewport. Default: `50`.

## Common `img` attributes
This component allow the usage of common `img` attributes like `alt`, `width`, `className`, etc. So you can use it as a normal `img` tag, just change `src` to `source` and (if you want to) add the other optional props.

## License
The MIT License (MIT)

Copyright (c) 2015 Sergio Daniel Xalambrí

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
