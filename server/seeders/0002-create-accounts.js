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
var adminAccount = {
  username: 'DemoAdmin',
  email: 'demoadmin@account.website.com',
  createdAt: timestamp,
  updatedAt: timestamp
}
var userAccount = {
  username: 'DemoUser',
  email: 'demouser@account.website.com',
  createdAt: timestamp,
  updatedAt: timestamp
}
// TODO: this should be replaced with a function that encrypts a param.
const createPassword = (password) => {
  return bcrypt.hash(password, serverConfig.saltRounds)
}

module.exports = {
  up: (queryInterface) => {
    return createPassword('admin')
      .then((hash) => {
        adminAccount.password = hash

        return createPassword('user')
      })
      .then((hash) => {
        userAccount.password = hash
        return queryInterface.sequelize.query('select * from "AccountTypes"')
      })
      .then((res) => {
        var accountTypes = res[0]
        var accountTypesLen = accountTypes.length

        for (let i = 0; i < accountTypesLen; i++) {
          let accountTypeName = accountTypes[i].name

          if (accountTypeName === 'Admin') {
            adminAccount.accountTypeId = accountTypes[i].id
          } else if (accountTypeName === 'User') {
            userAccount.accountTypeId = accountTypes[i].id
          }
        }
        return queryInterface.bulkInsert('Accounts', [adminAccount, userAccount], {})
      })
      .catch((err) => {
        log.warning(`failed to insert accounts with error:\n${err.message}`)
      })
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('Accounts', {
      $or: [ {email: adminAccount.email}, {email: userAccount.email} ]
    },
    {})
      .catch((err) => {
        log.warning(`failed to delete accounts with error:\n${err.message}`)
      })
  }
}
