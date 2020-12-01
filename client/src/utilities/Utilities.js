/**
 * https://stackoverflow.com/questions/21485545/is-there-a-way-to-tell-if-an-es6-promise-is-fulfilled-rejected-resolved
 * 
 * NB! unnecessary within components, but may be useful outside. Within components, you can just do 
 * Promise.then(res => this.data).catch(err => this.error) and check whether error or data exists.
 * 
 * USAGE: const newPromise = querablePromise(promise)
 * newPromise.isResolved() // gives true, when promise has resolved
 * ... etc
 * const result = newPromise.then(res => return res).catch(error => throw error) // to get result, or error
 * @param {Promise} promise -- a promise.
 */
export const querablePromise = function(promise) {
  if (promise.isResolved) return promise
  let isResolved = false;
  let isRejected = false;
  let result = promise.then( res => {
    isResolved = true;
    return res;
  }).catch(error => {
    console.log("reached here")
    isRejected = true;
    throw error;
  });

  result.isPending = () => { return (!isResolved && !isRejected); }
  result.isResolved = () => isResolved;
  result.isRejected = () => isRejected; 
  return result;
}