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

const Log = require('log')
const bcrypt = require('bcrypt')
const serverConfig = require('../config')
const timestamp = new Date()

const log = new Log()

module.exports = {
  up: (queryInterface, Sequelize) => {
    // Add email verification fields
    queryInterface.addColumn(
      'Accounts',
      'isVerified',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    )
    queryInterface.addColumn('Accounts', 'verifyCode', Sequelize.STRING)
    queryInterface.addColumn('Accounts', 'verifySentDate', Sequelize.DATE)
    // add password reset fields
    queryInterface.addColumn(
      'Accounts',
      'doPassReset',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    )
    queryInterface.addColumn('Accounts', 'passRestCode', Sequelize.STRING)
    queryInterface.addColumn('Accounts', 'passResetSentDate', Sequelize.DATE)
  }
}
