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
 * Handles generation and decoding of json web tokens.
 * @author Tim Miller
 */
const jwt = require('jsonwebtoken')
const config = require('../config')

class TokenHandler {
  /**
   * Generates and returns a json web token.
   *
   * @param {Object} account Account to encode.
   * @param {String} secret Secret key used to encode token.
   *
   * @returns {Object} Json web token signature.
   */
  static generateToken (account, secret) {
    delete account.password
    return jwt.sign({account: account}, secret, {expiresIn: config.tokenLifespan})
  }

  /**
   * Decodes and returns contents json web token.
   *
   * @param {Object} token Token to decode.
   * @param {String} secret Secret key used to decode token.
   *
   * @returns {Object} Json web token contents.
   */
  static decodeToken (token, secret) {
    return jwt.verify(token, secret)
  }
}

module.exports = TokenHandler
