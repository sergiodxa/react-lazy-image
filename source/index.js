import React, { PureComponent } from 'react';

import defaultSource from './spinner.js';
import readBlobFile from './read-blob-file.js';

type RectType = {
  bottom: number,
  height: number,
  left: number,
  right: number,
  top: number,
  width: number,
};

type PropType = {
  onLayout(event: { element: Object }): void,
  onError(event: { element: Object, error: Error }): void,
  onLoad(event: { element: Object }): void,
  onLoadEnd(event: { element: Object }): void,
  onLoadStart(event: { element: Object }): void,
  onAbort(event: { element: Object }): void,
  onProgress(event: { element: Object }): void,
  offset: ?number,
  source: string,
  defaultSource: ?string,
  type: ?string,
  minLoaded: ?number,
};

/**
 * Instance the default props
 * @type {PropTypes}
 */
const defaultProps: PropType = {
  onLayout: () => {},
  onError: () => {},
  onLoad: () => {},
  onLoadEnd: () => {},
  onLoadStart: () => {},
  onAbort: () => {},
  onProgress: () => {},
  offset: 0,
  defaultSource,
  type: '*',
  minLoaded: 50,
};

/**
 * Component to render an image using LazyLoad to request it only if the component is in
 * the viewport and abort the load if the component leaves the viewport
 */
class Image extends PureComponent {
  static defaultProps = defaultProps;

  /**
   * Bind component methods to `this`
   * @param  {PropType} props   [description]
   */
  constructor(props: PropType) {
    super(props);
    // bind function methods
    this.checkViewport = this.checkViewport.bind(this);
    this.setRef = this.setRef.bind(this);

    this.handleLoadEnd = this.handleLoadEnd.bind(this);
    this.handleAbort = this.handleAbort.bind(this);
    this.handleProgress = this.handleProgress.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleLoadStart = this.handleLoadStart.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
  }


  /**
   * The state contains the image base64 string to use
   * @type {Object}
   */
  state: { image: string } = {
    image: this.props.defaultSource,
  };


  /**
   * Call the onLayout after the component is renderer
   * Create the XHR object
   * Set the event listener for the scroll event to check if the component is in viewport
   * Check the viewport one time to now if it's already in it
   */
  componentDidMount() {
    this.props.onLayout({ element: this });

    this.request = new XMLHttpRequest();
    this.request.responseType = 'arraybuffer';

    window.addEventListener('scroll', this.checkViewport);
    this.checkViewport();
  }


  /**
   * Call the onLayout callback if the component is re-rendered
   */
  componentDidUpdate() {
    this.props.onLayout({ element: this });
  }


  /**
   * Remove scroll event listener if the component is unmounted
   */
  componentWillUnmount() {
    window.removeEventListener('scroll', this.checkViewport);
    this.request.abort();
  }


  /**
   * Get the reference to the image
   * @param {Element} element The DOM element to set the reference
   */
  setRef(element: Element): Object {
    this.element = element;
    return this;
  }


  /**
   * Fetch the image and save it in the state
   */
  fetch(): void {
    // set request event handlers
    this.request.onloadstart = this.handleLoadStart;
    this.request.onprogress = this.handleProgress;
    this.request.onload = this.handleLoad;
    this.request.onloadend = this.handleLoadEnd;
    this.request.onabort = this.handleAbort;
    this.request.onerror = this.handleError;

    // open AJAX request
    this.request.open('GET', this.props.source);
    // send request
    return this.request.send();
  }


  /**
   * Handle load start event
   * @param {Object} event Request start event object
   */
  handleLoadStart(event: Object): void {
    this.isRequesting = true;
    const element = this;

    if (event.lengthComputable) {
      this.progress.loaded = 0;
      this.progress.total = event.total;
    }

    return this.props.onLoadStart({ element });
  }


  /**
   * Set the loaded progress (and the total)
   * @param {Object} event The progress event data
   */
  handleProgress(event: Object): void {
    const element = this;

    if (event.lengthComputable) {
      this.progress.loaded = event.loaded;
    }

    return this.props.onProgress({ element });
  }


  /**
   * Handle the XHR load event
   * @param {Object} event The load event data
   */
  handleLoad(): void {
    const element: Image = this;
    this.isRequesting = false;
    return this.props.onLoad({ element });
  }


  /**
   * If the request ended successful get the response as a blob object, transform it to base64,
   * remove the scroll event listener and update the `state.image` value`
   * @param {Object} event The load end event data
   */
  handleLoadEnd(): void {
    const element: Image = this;

    // if the request status es between 200 and 300
    if (this.request.status >= 200 && this.request.status < 300) {
      // transform response to a blob
      const blob: Blob = new Blob([this.request.response], { type: `image/${this.props.type}` });
      // read blob as a base64 string
      return readBlobFile(blob)
        .then((image: string) => {
          // set the image base64 string in the state
          this.setState({ image }, (): void => {
            // remove event scroll listener
            window.removeEventListener('scroll', this.checkViewport);
            // set the component as not requesting anymore
            this.isRequesting = false;
            // call the `onLoadEnd` callback
            return this.props.onLoadEnd({ element });
          });
        })
        .catch((error: Object): void => {
          // set the component as not requesting anymore
          this.isRequesting = false;
          // if an error happens call the `onError` callback
          return this.props.onError({ error, element });
        });
    }

    return null;
  }


  /**
   * Handle request error event
   * @param {Object} event The error event data
   */
  handleError(event: Object): void {
    const element: Image = this;
    this.isRequesting = false;
    return this.props.onError({ element, error: new Error(event.response) });
  }


  /**
   * Handle the request abort event
   * @param {Object} event The abort event data
   */
  handleAbort(): void {
    const element = this;
    this.isRequesting = false;
    return this.props.onAbort({ element });
  }


  /**
   * Check if the component is in the current viewport and load the image
   */
  checkViewport(): Promise | null {
    if (this.isInViewport && !this.isRequesting) {
      // if is in viewport and is not requesting start fetching
      return this.fetch();
    }
    if (!this.isInViewport && this.isRequesting) {
      // if isn't in viewport and is requesting
      if (this.amountLoaded < this.props.minLoaded || isNaN(this.amountLoaded)) {
        // if the amount loaded is lower than the `this.props.minLoaded`
        // or is NaN abort the request
        return this.request.abort();
      }
    }
    return null;
  }


  /**
   * Define the prop types
   * @type {PropType}
   */
  props: PropType;


  /**
   * If the component is requesting an image or not
   * @type {Boolean}
   */
  isRequesting: boolean = false;


  /**
   * Progress loaded and total amount of bytes
   * @type {Object}
   */
  progress: { loaded: number, total: number } = {
    loaded: 0,
    total: 1,
  };


  /**
   * The progress of amount lodaded
   * @return {Number} The percentaje loaded
   */
  get amountLoaded(): number {
    return (this.progress.loaded * 100) / this.progress.total;
  }


  /**
   * Check if the component is in the viewport
   * @return {Boolean} If the component is in viewport
   */
  get isInViewport(): boolean {
    // get element position in viewport
    const rect: RectType = this.element.getBoundingClientRect();
    // get viewport height and width
    const viewportHeight: number = (window.innerHeight || document.documentElement.clientHeight);
    const viewportWidth: number = (window.innerWidth || document.documentElement.clientWidth);
    // check if the element is in the viewport (or near to them)
    return (
      rect.bottom >= (0 - this.props.offset) &&
      rect.right >= (0 - this.props.offset) &&
      rect.top < (viewportHeight + this.props.offset) &&
      rect.left < (viewportWidth + this.props.offset)
    );
  }


  /**
   * Get the images props without the component own props
   * @return {Object} The filtered props
   */
  get imgProps(): Object {
    const ownProps = [
      'onLayout',
      'onError',
      'onLoad',
      'onLoadEnd',
      'onLoadStart',
      'onAbort',
      'onProgress',
      'resizeMode',
      'source',
      'defaultSource',
      'offset',
      'minLoaded',
    ];

    return Object
      .keys(this.props)
      .filter((propName: string): boolean => ownProps.indexOf(propName) === -1)
      .reduce(
        (props: PropType, propName: string): PropType => ({
          ...props,
          [propName]: this.props[propName],
        }),
        {},
      );
  }


  /**
   * Component renderer method
   * @return {Object} The image JSX element
   */
  render(): Object {
    return (
      <img
        {...this.imgProps}
        ref={this.setRef}
        src={this.state.image}
      />
    );
  }
}

export default Image;
