/**
 * @license
 * Copyright 2017 Tim Miller.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished
 * to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * @author Tim Miller
 */
'use strict'

process.env.NODE_ENV = 'test'

const Account = require('../models').Account
const AccountType = require('../models').AccountType
const TokenHandler = require('../modules/TokenHandler')
const serverConfig = require('../config')
const strings = require('../config/strings')

const Log = require('log')
const bcrypt = require('bcrypt')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../app')

chai.use(chaiHttp)
chai.should()
const log = new Log()
const authRoute = '/api/auth'

describe(authRoute + ' tests', () => {
  const authTestUserPassword = 'authtestuser'
  let authTestUser = {
    email: 'authtestuser@account.website.com',
    username: 'authtestuser'
  }

  before(done => {
    AccountType.findOne({where: {name: 'User'}})
      .then(accountType => {
          // get user account id
        authTestUser.accountTypeId = accountType.id
          // hash password
        return bcrypt.hash(authTestUserPassword, serverConfig.saltRounds)
      })
      .then(passwordHash => {
          // add password to account
        authTestUser.password = passwordHash
          // save account
        return Account.create(authTestUser)
      })
      .then(account => {
        authTestUser.id = account.id
        authTestUser.password = authTestUserPassword
        done()
      })
      .catch(err => {
        log.error(`failed before with: ${err.message}`)
        done()
      })
  })

  after(done => {
    Account.destroy({ where: { id: authTestUser.id } })
      .then(count => {
        done()
      })
      .catch(err => {
        log.error('failed after with: ' + err.message)
        done()
      })
  })

  const checkAccountContents = account => {
        // check account
    account.should.have.property('id')
    account.id.should.have.equal(authTestUser.id)
    account.should.have.property('username')
    account.username.should.equal(authTestUser.username)
    account.should.have.property('email')
    account.email.should.equal(authTestUser.email)
    account.should.have.property('accountType')
    account.should.not.have.property('password')
        // check account type contents
    let accountType = account.accountType
    accountType.should.have.property('id')
    accountType.id.should.equal(authTestUser.accountTypeId)
    accountType.should.have.property('name')
    accountType.name.should.equal('User')
  }

  describe('POST tests', () => {
    it('should test that a successful auth with email returns a token', done => {
      let req = {email: authTestUser.email, password: authTestUser.password}

      chai.request(server)
        .post(authRoute)
        .send(req)
        .end((err, res) => {
          if (err) {
            log.error(`Test failed: ${err.message}`)
          }
          res.status.should.equal(200)
            // check account contents
          res.body.should.have.property('account')
          let account = res.body.account
          checkAccountContents(account)
          res.body.should.have.property('token')
            // extract token contents
          let tokenContents = TokenHandler.decodeToken(res.body.token,
                serverConfig.signingToken)
            // check token contents
          tokenContents.should.have.property('account')
          checkAccountContents(tokenContents.account)
          done()
        })
    })

    it('should test that a successful auth with username returns a token', done => {
      let req = {username: authTestUser.username, password: authTestUser.password}

      chai.request(server)
        .post(authRoute)
        .send(req)
        .end((err, res) => {
          if (err) {
            log.error(`Test failed: ${err.message}`)
          }
          res.status.should.equal(200)
            // check account contents
          res.body.should.have.property('account')
          let account = res.body.account
          checkAccountContents(account)
          res.body.should.have.property('token')
            // extract token contents
          let tokenContents = TokenHandler.decodeToken(res.body.token,
                serverConfig.signingToken)
            // check token contents
          tokenContents.should.have.property('account')
          checkAccountContents(tokenContents.account)
          done()
        })
    })

    it('should test that a login attempt with a missing password doesn\'t work', done => {
      let req = {username: authTestUser.username}

      chai.request(server)
        .post(authRoute)
        .send(req)
        .end((err, res) => {
          if (err) {
            log.error(`Test failed: ${err.message}`)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.missingDetailsErr)
          done()
        })
    })

    it('should test that a login attempt with a missing email/username doesn\'t work', done => {
      let req = {password: authTestUser.password}

      chai.request(server)
        .post(authRoute)
        .send(req)
        .end((err, res) => {
          if (err) {
            log.error(`Test failed: ${err.message}`)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.missingDetailsErr)
          done()
        })
    })

    it('should test that a login attempt with a missing email and password doesn\'t work',
    done => {
      let req = {}

      chai.request(server)
        .post(authRoute)
        .send(req)
        .end((err, res) => {
          if (err) {
            log.error(`Test failed: ${err.message}`)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.missingDetailsErr)
          done()
        })
    })
  })

  describe('PUT tests', () => {
    it('should test that a token reset is successful', done => {
      let req = {email: authTestUser.email, password: authTestUser.password}
      let authToken = null

      chai.request(server)
        .post(authRoute)
        .send(req)
        .end((err, res) => {
          if (err) {
            log.error(`Test failed: ${err.message}`)
          }
          res.body.should.have.property('token')
          authToken = res.body.token

          chai.request(server)
            .put(authRoute)
            .set('authorization', 'Bearer ' + authToken)
            .end((err, res) => {
              if (err) {
                log.error(`Test failed: ${err.message}`)
              }
              res.status.should.equal(200)
              res.body.should.have.property('token')
              let tokenContents = TokenHandler.decodeToken(res.body.token,
                    serverConfig.signingToken)
              tokenContents.should.have.property('account')
              checkAccountContents(tokenContents.account)
              done()
            })
        })
    })

    it('should test that a token reset fails when the authorization header is missing', done => {
      chai.request(server)
        .put(authRoute)
        .end((err, res) => {
          if (err) {
            log.error(`Test failed: ${err.message}`)
          }
          res.status.should.equal(401)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.unauthorizedErr)
          done()
        })
    })
  })
})
