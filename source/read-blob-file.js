/**
 * Read Blob file as a base64 string
 * @param  {Blob}    file The Blob file instance to read
 * @return {Promise}      A reader promise
 */
function readBlobFile(file: Blob): Promise {
  function promiseHandler(resolve: Function, reject: Function): FileReader {
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function onReadEnd(): void {
      if (reader.error) return reject(reader.error);
      return resolve(reader.result);
    };
    return reader;
  }

  return new Promise(promiseHandler);
}

export default readBlobFile;
