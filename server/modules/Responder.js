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
 * Returns 4xx messages.
 * @author Tim Miller
 */
const strings = require('../config/strings')

class Responder {
  /**
   * Returns a 403 error with a message.
   *
   * @param {Object} res Express server response object
   *
   * @returns {Object} Http response with a forbidden error message.
   */
  static returnForbidden (res) {
    return res.status(403).send({message: strings.forbiddenErr})
  }

  /**
   * Returns a 401 error with a message.
   *
   * @param {Object} res Express server response object
   *
   * @returns {Object} Http response with a unauthorized error message.
   */
  static returnUnauthorized (res) {
    return res.status(401).send({message: strings.unauthorizedErr})
  }
}

module.exports = Responder
