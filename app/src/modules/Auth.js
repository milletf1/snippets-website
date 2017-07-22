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
 * Manages auth token for logged in account.
 * @author Tim Miller
 */
class Auth {
  /**
   * Authorization token storage key.
   * @typedef {Object} AuthStorageKeys
   * @property {string} token - authorization token.
   * @property {string} tokenIssueTime - Time of token authorization.
   */

   /**
    * Returns key values for accessing auth token properties in local storage.
    *
    * @returns {AuthStorageKeys} Key values for authoriaztion token in local storage.
    */
  static getStorageKeys () {
    return {
      token: 'token',
      tokenIssueTime: 'tokenIssueTime'
    }
  }

  /**
   * Returns the maximum age of an auth token.
   *
   * @returns {number} Maximum age of an auth token in milliseconds.
   */
  static getTokenLifespan () {
    return 86400000
  }

  /**
   * Saves an auth token and records the current time in milliseconds since epoch.
   *
   * @param {string} token - Auth token to save.
   */
  static setToken (token) { // TODO: rename calls to this function (it was authenticateUser)
    let storageKeys = this.getStorageKeys()
    localStorage.setItem(storageKeys.token, token)
    localStorage.setItem(storageKeys.tokenIssueTime, new Date().getTime())
  }

  /**
   * Checks if a live auth token is stored in local storage.
   *
   * @returns {boolean} Result of auth token check.
   */
  static isUserAuthenticated () {
    return localStorage.getItem(this.getStorageKeys().token) != null
  }

  /**
   * Removes auth token and token issue time from local storage.
   */
  static deauthenticateUser () {
    let storageKeys = this.getStorageKeys()
    localStorage.removeItem(storageKeys.token)
    localStorage.removeItem(storageKeys.tokenIssueTime)
  }

  /**
   * A promise for an authorization token.
   *
   * @promise AuthTokenPromise
   * @fulfill {string} An authorization token.
   * @reject {Message} A message detailing the error.
   */

  /**
   * An error message object.
   * @typedef {Object} Message
   * @property {string} message - message content.
   */

  /**
   * Requests web API for an updated authorization token.
   *
   * @param {string} token - The token to update.
   *
   * @returns {AuthTokenPromise} A promise to get an updated authorization token.
   */
  static getNewToken (token) {
    let deferred = $.Deferred()
    $.ajax({
      url: '/api/auth',
      type: 'put',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      processData: false,
      headers: {
        'Authorization': 'Bearer ' + token
      },
      success: res => {
        deferred.resolve(res.token)
      },
      error: (xhr, status, err) => {
        deferred.reject({ message: err.message })
      }
    })
    return deferred
  }

  /**
   * Returns a valid authorization token.
   *
   * @returns {AuthTokenPromise} A promise to get a valid authorization token.
   */
  static getToken () {
    let deferred = $.Deferred()
    let token = localStorage.getItem(this.getStorageKeys().token)

    // check if it is time to get a new token
    let tokenAge = new Date().getTime() - this.getTokenIssueTime()
    let tokenLifespan = this.getTokenLifespan()

    if (tokenAge > (tokenLifespan / 2)) {
      if (tokenAge > tokenLifespan) {
        this.deauthenticateUser()
      } else {
        this.getNewToken(token)
          .then(token => {
            this.authenticateUser(token)
            deferred.resolve(token)
          })
          .fail(err => {
            console.log('AuthModule.getToken() failed to get new token')
            console.log(err.message)
            deferred.reject({ message: 'jwt expired' })
          })
      }
    } else {
      deferred.resolve(token)
    }
    return deferred
  }

  /**
   * Returns token issue time.
   *
   * @returns {number} Timestamp of when token was saved in local storage.  This is expressed as
   * number of milliseconds since epoch.
   */
  static getTokenIssueTime () {
    return parseInt(localStorage.getItem(this.getStorageKeys().tokenIssueTime))
  }
}
export default Auth
