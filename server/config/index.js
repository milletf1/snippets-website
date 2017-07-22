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
 * Contains configuration settings for Express server.
 * @author Tim Miller
 */
module.exports = {
  /** Token for signing json web tokens. */
  signingToken: 'superawesomesecret',
  /** Lifespan of json web tokens. */
  tokenLifespan: '1d',
  /** Salt rounds for hashing account passwords. */
  saltRounds: 10,
  /** Maximum number of results that can be returned for GET requests. */
  limitCap: 25,
  /** Nodemailer host. */
  mailerHost: 'gmail.com',
  /** Nodemailer account name. */
  mailerName: 'someguy@gmail.com',
  /** Nodemailer account password. */
  mailerPass: 'password'
}
