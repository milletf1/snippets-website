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
 * Local storage for authorized account.
 * @author Tim Miller
 */
class Account {
  /**
   * Account storage keys.
   * @typedef {Object} AccountStorageKeys
   * @property {string} id - Account id key.
   * @property {string} username - Account username key.
   * @property {string} email - Account email key.
   * @property {string} type - Account type key.
   */

  /**
   * Account.
   * @typedef Account
   * @property {number} id - Id of account.
   * @property {string} username - Username of account.
   * @property {string}  email - Email address of account.
   * @property {AccountType}  accountType - Type of account.
   */

  /**
   * Account type.
   * @typedef AccountType
   * @property {number} id - Id of account type.
   * @property {string} name - Name of account type.
   */

  /**
   * Returns key values for accessing account properties in local storage.
   *
   * @returns {AccountStorageKeys} Key values for account in local storage.
   */
  static getStorageKeys () {
    return {
      id: 'accountId',
      username: 'accountUsername',
      email: 'accountEmail',
      type: 'accountTypeName'
    }
  }

  /**
   * Saves account to local storage.
   *
   * @param {Account} account - Account to  save.
   *
   * @throws {TypeError} A TypeError will be thrown if account is not an object.
   * @throws {TypeError} A TypeError will be thrown if account.id is not an integer.
   * @throws {TypeError} A TypeError will be thrown if account.username is not a string.
   * @throws {TypeError} A TypeError will be thrown if account.email is not a string.
   * @throws {TypeError} A TypeError will be thrown if account.accountType is not an object.
   * @throws {TypeError} A TypeError will be thrown if account.accountType.name is not a string.
   */
  static saveAccount (account) {
    if (typeof account !== 'object' || account === null) {
      throw new TypeError('account must be an object')
    } else if (!Number.isInteger(account.id)) {
      throw new TypeError('account.id must be an integer')
    } else if (typeof account.username !== 'string') {
      throw new TypeError('account.username must be a string')
    } else if (typeof account.email !== 'string') {
      throw new TypeError('account.email must be a string')
    } else if (typeof account.accountType !== 'object' || account.accountType === null) {
      throw new TypeError('account.accountType must be an object')
    } else if (typeof account.accountType.name !== 'string') {
      throw new TypeError('account.accountType.name must be a string')
    }
    let storageKeys = this.getStorageKeys()
    localStorage.setItem(storageKeys.id, account.id)
    localStorage.setItem(storageKeys.username, account.username)
    localStorage.setItem(storageKeys.email, account.email)
    localStorage.setItem(storageKeys.type, account.accountType.name)
  }

  /**
   * Returns the saved account.
   *
   * @returns {Account} Account saved in local storage.
   */
  static getAccount () {
    return {
      id: this.getAccountId(),
      username: this.getAccountName(),
      email: this.getAccountEmail(),
      type: this.getAccountType()
    }
  }

  /**
   * Returns id of saved account.
   *
   * @returns {number} Id of account saved in local storage.
   */
  static getAccountId () {
    let id = localStorage.getItem(this.getStorageKeys().id)
    if (typeof id !== 'number') {
      id = parseInt(id)
    }
    return id
  }

  /**
   * Returns name of saved account.
   *
   * @returns {string} Name of account saved in local storage.
   */
  static getAccountName () {
    return localStorage.getItem(this.getStorageKeys().username)
  }

  /**
   * Returns email address of saved account.
   *
   * @returns {string} Email address of account saved in local storage.
   */
  static getAccountEmail () {
    return localStorage.getItem(this.getStorageKeys().email)
  }

  /**
   * Returns name of saved account type.
   *
   * @returns {string} name of account saved in local storage.
   */
  static getAccountType () {
    return localStorage.getItem(this.getStorageKeys().type)
  }

  /** Deletes saved account from local storage. */
  static removeAccount () {
    let storageKeys = this.getStorageKeys()
    localStorage.removeItem(storageKeys.id)
    localStorage.removeItem(storageKeys.username)
    localStorage.removeItem(storageKeys.email)
    localStorage.removeItem(storageKeys.type)
  }
}

export default Account
