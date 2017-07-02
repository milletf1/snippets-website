/**
 * @license
 * Copyright 2017 Tim Miller.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished
 * to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
'use strict'
/**
 * Utilities used by express server.
 * @author Tim Miller
 */
class Utils {
  /**
   * Finds and returns jwt from request headers.
   *
   * @param {object} headers - express request headers
   *
   * @throws {Error} An error is thrown if authorization header is not found.
   * @throws {Error} An error is thrown if authorization token is malformed.
   *
   * @returns {String} Json web token signature.
   */
  static getToken (headers) {
    if (!headers.authorization) {
      throw new Error('authorization header not found')
    }

    let parts = headers.authorization.split(' ')

    if (parts.length !== 2) {
      throw new Error('maliformed authorization token')
    }
    return parts[1]
  }
}

module.exports = Utils
