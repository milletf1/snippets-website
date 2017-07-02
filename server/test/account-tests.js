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
const accountsRoute = '/api/accounts'

describe(accountsRoute + ' tests', () => {
  let adminAccountToken = null
  let userAccountToken = null

  let userAccountType = null
  let adminAccountType = null

  let toDelete = []

  before(done => {
    // get account types,
    AccountType.findAll({})
    .then(accountTypes => {
      accountTypes.forEach(accountType => {
        if (accountType.name === 'User') {
          userAccountType = accountType
        } else if (accountType.name === 'Admin') {
          adminAccountType = accountType
        }
      })
      // get an auth token for demo user
      return Account.findOne({
        where: {
          username: 'DemoUser'
        },
        include: [
          {
            model: AccountType,
            as: 'accountType'
          }
        ]
      })
    })
    .then(account => {
      userAccountToken = TokenHandler.generateToken({
        id: account.id,
        username: account.username,
        email: account.email,
        accountType: account.accountType
      }, serverConfig.signingToken)
      // get an auth token for demo admin
      return Account.findOne({
        where: {
          username: 'DemoAdmin'
        },
        include: [
          {
            model: AccountType,
            as: 'accountType'
          }
        ]
      })
    })
    .then(account => {
      adminAccountToken = TokenHandler.generateToken({
        id: account.id,
        username: account.username,
        email: account.email,
        accountType: account.accountType
      }, serverConfig.signingToken)
      done()
    })
  })

  after(done => {
    Account.destroy({ where: { id: { $in: toDelete } } })
      .then(count => {
        done()
      })
      .catch(err => {
        log.error(`after tests failed with: ${err.message}`)
        done()
      })
  })

  describe('POST tests', () => {
    it('should test create a user account works', done => {
      let createUser = {
        email: 'testuser@someplace.com',
        username: 'testuser',
        password: 'testuserpassword'
      }
      chai.request(server)
        .post(accountsRoute + '/user')
        .send(createUser)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
          res.body.should.have.property('account')
          let account = res.body.account
          account.should.have.property('id')
          toDelete.push(account.id)
          account.should.have.property('email')
          account.email.should.equal(createUser.email)
          account.should.have.property('username')
          account.username.should.equal(createUser.username)
          account.should.not.have.property('password')
          account.should.have.property('accountType')
          account.accountType.id.should.equal(userAccountType.id)
          res.body.should.have.property('token')
          done()
        })
    })

    it('should test that an admin can create an admin account', done => {
      let createAdmin = {
        email: 'testadmin@someplace.com',
        username: 'testadmin',
        password: 'testadminpassword'
      }

      chai.request(server)
        .post(accountsRoute + '/admin')
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .send(createAdmin)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
          res.body.should.have.property('id')
          toDelete.push(res.body.id)
          res.body.should.have.property('email')
          res.body.email.should.equal(createAdmin.email)
          res.body.should.have.property('username')
          res.body.username.should.equal(createAdmin.username)
          res.body.should.not.have.property('password')
          done()
        })
    })

    it('should test that a user cannot create an admin account', done => {
      let failCreateAdmin = {
        email: 'testadmin@someplace.com',
        username: 'testadmin',
        password: 'testadminpassword'
      }

      chai.request(server)
        .post(accountsRoute + '/admin')
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(failCreateAdmin)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.body.id) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(403)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.forbiddenErr)
          done()
        })
    })

    it('should test that an admin account cannot be created if not logged' +
      ' into an account', done => {
      let user = {
        username: 'FailAdminCreate',
        email: 'failadminacreate@account.website.com',
        password: 'failadmincreatepassword'
      }
      chai.request(server)
        .post(accountsRoute + '/admin')
        .send(user)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.body.id) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(401)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.unauthorizedErr)
          done()
        })
    })

    it('should test that an account cannot be created if it shares an ' +
      'email address with an existing account', done => {
      let user = {
        username: 'DemoUserSecond',
        email: 'demouser@account.website.com',
        password: 'user'
      }
      chai.request(server)
        .post(accountsRoute + '/user')
        .send(user)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.body.account && res.body.account.id) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.accountExistsErr)
          done()
        })
    })

    it('should test that an account cannot be created if it share a ' +
            'username with an existing account', done => {
      let user = {
        username: 'DemoUser',
        email: 'demousersecond@account.website.com',
        password: 'user'
      }
      chai.request(server)
        .post(accountsRoute + '/user')
        .send(user)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.body.account && res.body.account.id) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.accountExistsErr)
          done()
        })
    })

    it('should test that an account with an invalid email address is not ' +
            'created', done => {
      let user = {
        username: 'BadEmailName',
        email: 'bademailname',
        password: 'user'
      }
      chai.request(server)
        .post(accountsRoute + '/user')
        .send(user)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.body.account && res.body.account.id) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidEmailErr)
          done()
        })
    })

    it('should test that an account without an email is not created', done => {
      let user = {
        username: 'FailNoEmail',
        password: 'user'
      }
      chai.request(server)
        .post(accountsRoute + '/user')
        .send(user)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.body.account && res.body.account.id) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.missingEmailErr)
          done()
        })
    })

    it('should test that an account without an username is not created', done => {
      let user = {
        email: 'failnoemail@account.website.com',
        password: 'user'
      }
      chai.request(server)
        .post(accountsRoute + '/user')
        .send(user)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.body.account && res.body.account.id) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.missingUsernameErr)
          done()
        })
    })

    it('should test that an account without a password is not created', done => {
      let user = {
        username: 'FailNoEmail',
        email: 'failnoemail@account.website.com'
      }
      chai.request(server)
        .post(accountsRoute + '/user')
        .send(user)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.body.account && res.body.account.id) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.missingPasswordErr)
          done()
        })
    })

    it('should test that an account fails to create when it contain\'s a password with less than ' +
      '4 characters', done => {
      let user = {
        username: 'rg4th',
        email: 'ytub@grs.com',
        password: '123'
      }
      chai.request(server)
        .post(accountsRoute + '/user')
        .send(user)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.body.account && res.body.account.id) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidPasswordErr)
          done()
        })
    })

    it('should test that an account fails to create when it contain\'s a password with more than ' +
      '24 characters', done => {
      let user = {
        username: 'biglypassword',
        email: 'biglypassword@failpassword.com',
        password: '1234567890123456789012345'
      }

      chai.request(server)
        .post(accountsRoute + '/user')
        .send(user)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.body.account && res.body.account.id) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidPasswordErr)
          done()
        })
    })

    it('should test that an account fails to create when it contain\'s a username with more than ' +
      '16 characters', done => {
      let user = {
        username: 'someverybigusernamethathaswaytoomanycharacters',
        email: 'some@verybigusername.com',
        password: 'password'
      }

      chai.request(server)
        .post(accountsRoute + '/user')
        .send(user)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.body.account && res.body.account.id) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidUsernameErr)
          done()
        })
    })

    it('should test that account fails to create when it contain\'s a username with spaces',
    done => {
      let user = {
        username: 'bad spaces',
        email: 'bad@spaces.com',
        password: 'password'
      }

      chai.request(server)
        .post(accountsRoute + '/user')
        .send(user)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.body.account && res.body.account.id) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidUsernameErr)
          done()
        })
    })

    it('should test that an account fails to create when it contain\'s a username with illegal' +
    ' characters', done => {
      let user = {
        username: '!<some-name>!',
        email: 'bad@spaces.com',
        password: 'password'
      }

      chai.request(server)
        .post(accountsRoute + '/user')
        .send(user)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.body.account && res.body.account.id) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidUsernameErr)
          done()
        })
    })
  })

  describe('GET tests', () => {
    let getUser1 = {
      username: 'GetUser1',
      email: 'getuser1@account.website.com',
      password: 'user'
    }
    let getUser2 = {
      username: 'GetUser2',
      email: 'getuser2@account.website.com',
      password: 'user'
    }
    let getAdmin1 = {
      username: 'GetAdmin1',
      email: 'getadmin1@account.website.com',
      password: 'admin'
    }
    let getAdmin2 = {
      username: 'GetAdmin2',
      email: 'getadmin2@account.website.com',
      password: 'admin'
    }

    before(done => {
      getUser1.accountTypeId = userAccountType.id
      getUser2.accountTypeId = userAccountType.id
      getAdmin1.accountTypeId = adminAccountType.id
      getAdmin2.accountTypeId = adminAccountType.id

            // hash user1 password
      bcrypt.hash(getUser1.password, serverConfig.saltRounds)
        .then(getUser1PasswordHash => {
            // save user1 account
          getUser1.password = getUser1PasswordHash
          return Account.create(getUser1)
        })
        .then(savedGetUser1 => {
          getUser1.id = savedGetUser1.id
          toDelete.push(getUser1.id)
            // hash user2 password
          return bcrypt.hash(getUser2.password, serverConfig.saltRounds)
        })
        .then(getUser2PasswordHash => {
            // save user2 account
          getUser2.password = getUser2PasswordHash
          return Account.create(getUser2)
        })
        .then(savedGetUser2 => {
          getUser2.id = savedGetUser2.id
          toDelete.push(getUser2.id)
            // hash admin1 password
          return bcrypt.hash(getAdmin1.password, serverConfig.saltRounds)
        })
        .then(getAdmin1PasswordHash => {
            // save admin1 account
          getAdmin1.password = getAdmin1PasswordHash
          return Account.create(getAdmin1)
        })
        .then(savedGetAdmin1 => {
          getAdmin1.id = savedGetAdmin1.id
          toDelete.push(getAdmin1.id)
            // hash admin2 password
          return bcrypt.hash(getAdmin2.password, serverConfig.saltRounds)
        })
        .then(getAdmin2PasswordHash => {
            // save admin2 account
          getAdmin2.password = getAdmin2PasswordHash
          return Account.create(getAdmin2)
        })
        .then(savedGetAdmin2 => {
          getAdmin2.id = savedGetAdmin2.id
          toDelete.push(getAdmin2.id)
          done()
        })
    })// end GET tests before function

    it('should test that find all works', done => {
      Account.findAll({})
        .then(accounts => {
          let numAccounts = accounts.length

          chai.request(server)
            .get(accountsRoute)
            .end((err, res) => {
              if (err) {
                log.error('error:\n' + JSON.stringify(err))
              }
              res.status.should.equal(200)
              res.body.should.have.property('accounts')
              res.body.accounts.should.be.a('array')
              res.body.accounts.length.should.equal(numAccounts)
              done()
            })
        })
    })

    it('should test that find all by account type works', done => {
      Account.findAll({where: {accountTypeId: userAccountType.id}})
        .then(accounts => {
          let numUserAccountTypes = accounts.length

          chai.request(server)
            .get(accountsRoute)
            .query({accountTypeId: userAccountType.id})
            .end((err, res) => {
              if (err) {
                log.error('error:\n' + JSON.stringify(err))
              }
              res.status.should.equal(200)
              res.body.should.have.property('accounts')
              res.body.accounts.should.be.a('array')
              res.body.accounts.length.should.equal(numUserAccountTypes)

              res.body.accounts.forEach((account) => {
                account.accountTypeId.should.equal(userAccountType.id)
              })
              done()
            })
        })
    })

    it('should test that find all by email works', done => {
      chai.request(server)
        .get(accountsRoute)
        .query({ email: getUser1.email })
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
          res.body.should.have.property('accounts')
          res.body.accounts.should.be.a('array')
          res.body.accounts.length.should.be.eql(1)
          let getAccount = res.body.accounts[0]
          getAccount.email.should.equal(getUser1.email)
          getAccount.username.should.equal(getUser1.username)
          done()
        })
    })

    it('should test that find all by username works', done => {
      chai.request(server)
        .get(accountsRoute)
        .query({ username: getUser2.username })
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
          res.body.should.have.property('accounts')
          res.body.accounts.should.be.a('array')
          res.body.accounts.length.should.be.eql(1)
          let getAccount = res.body.accounts[0]
          getAccount.email.should.equal(getUser2.email)
          getAccount.username.should.equal(getUser2.username)
          done()
        })
    })

    it('should test that get accounts does not expose password', done => {
      chai.request(server)
        .get(accountsRoute)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
          res.body.should.have.property('accounts')
          res.body.accounts.should.be.a('array')
          res.body.accounts.should.all.not.have.property('password')
          done()
        })
    })

    it('should test that find one by id works', done => {
      chai.request(server)
        .get(accountsRoute + '/' + getUser1.id)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
          res.body.should.have.property('id')
          res.body.should.have.property('username')
          res.body.should.have.property('email')
          res.body.should.not.have.property('password')
          done()
        })
    })

    it('should test that find one by id fails when given a bad id parameter', done => {
      chai.request(server)
        .get(accountsRoute + '/999999999')
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(404)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.accountNotFoundErr)
          done()
        })
    })

    it('should test that find one by id fails when given a non integer id parameter', done => {
      chai.request(server)
        .get(accountsRoute + '/potato')
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal('invalid input syntax for integer: "potato"')
          done()
        })
    })
  })

  describe('PUT tests', () => {
    let updateSelfUser = {
      email: 'updateselfuser@account.website.com',
      username: 'updateselfuser',
      password: 'updateselfuser'
    }
    let updateSelfUserToken = null
    let updateSelfAdmin = {
      email: 'updateselfadmin@account.website.com',
      username: 'updateselfadmin',
      password: 'updateselfadmin'
    }
    let updateSelfAdminToken = null
    let updateOtherUser = {
      email: 'updateotheruser@account.website.com',
      username: 'updateotheruser',
      password: 'updateotheruser'
    }
    let updateOtherUserToken = null
    let updateOtherAdmin = {
      email: 'updateotheradmin@account.website.com',
      username: 'updateotheradmin',
      password: 'updateotheradmin'
    }
    let updateOtherAdminToken = null
    let updateOtherUserTarget = {
      email: 'updateotherusertarget@account.website.com',
      username: 'updateotherusertarget',
      password: 'updateotherusertarget'
    }
    let updateOtherAdminTarget = {
      email: 'updateotheradmintarget@account.website.com',
      username: 'updateotheradmintarget',
      password: 'updateotheradmintarget'
    }

    let failUpdateSmallPassword = {
      email: 'failsmallpassword@account.website.com',
      username: 'failsmallpassword',
      password: 'updateotheradmintarget'
    }
    let failUpdateSmallPasswordToken = null
    let failUpdateBigPassword = {
      email: 'pleaseworknow@account.website.com',
      username: 'r323234f',
      password: 'fgw5ger'
    }
    let failUpdateBigPasswordToken = null

    before(done => {
      updateSelfUser.accountTypeId = userAccountType.id
      updateSelfAdmin.accountTypeId = adminAccountType.id
      updateOtherUser.accountTypeId = userAccountType.id
      updateOtherAdmin.accountTypeId = adminAccountType.id
      updateOtherUserTarget.accountTypeId = userAccountType.id
      updateOtherAdminTarget.accountTypeId = adminAccountType.id
      failUpdateSmallPassword.accountTypeId = userAccountType.id
      failUpdateBigPassword.accountTypeId = userAccountType.id
      // hash updateSelfUser password
      bcrypt.hash(updateSelfUser.password, serverConfig.saltRounds)
        .then(updateSelfUserPasswordHash => {
          // save updateSelfUser account
          updateSelfUser.password = updateSelfUserPasswordHash
          return Account.create(updateSelfUser)
        })
        .then(savedUpdateSelfUser => {
          updateSelfUser.id = savedUpdateSelfUser.id
          toDelete.push(updateSelfUser.id)
          updateSelfUser.accountType = userAccountType
          updateSelfUserToken = TokenHandler.generateToken(updateSelfUser,
            serverConfig.signingToken)
          // hash updateSelfAdmin password
          return bcrypt.hash(updateSelfAdmin.password, serverConfig.saltRounds)
        })
        .then(updateSelfAdminPasswordHash => {
          updateSelfAdmin.password = updateSelfAdminPasswordHash
          // save updateSelfAdmin account
          return Account.create(updateSelfAdmin)
        })
        .then(savedUpdateSelfAdmin => {
          updateSelfAdmin.id = savedUpdateSelfAdmin.id
          toDelete.push(updateSelfAdmin.id)
          updateSelfAdmin.accountType = adminAccountType
          updateSelfAdminToken = TokenHandler.generateToken(updateSelfAdmin,
            serverConfig.signingToken)
          // hash updateOtherUser password
          return bcrypt.hash(updateOtherUser.password, serverConfig.saltRounds)
        })
        .then(updateOtherUserPasswordHash => {
          updateOtherUser.password = updateOtherUserPasswordHash
          // save updateOtherUser account
          return Account.create(updateOtherUser)
        })
        .then(savedUpdateOtherUser => {
          updateOtherUser.id = savedUpdateOtherUser.id
          toDelete.push(updateOtherUser.id)
          updateOtherUser.accountType = userAccountType
          updateOtherUserToken = TokenHandler.generateToken(updateOtherUser,
            serverConfig.signingToken)
          // hash updateOtherAdmin password
          return bcrypt.hash(updateOtherAdmin.password, serverConfig.saltRounds)
        })
        .then(updateOtherAdminPasswordHash => {
          updateOtherAdmin.password = updateOtherAdminPasswordHash
          // save updateOtherAdmin account
          return Account.create(updateOtherAdmin)
        })
        .then(savedUpdateOtherAdmin => {
          updateOtherAdmin.id = savedUpdateOtherAdmin.id
          toDelete.push(updateOtherAdmin.id)
          updateOtherAdmin.accountType = adminAccountType
          updateOtherAdminToken = TokenHandler.generateToken(updateOtherAdmin,
            serverConfig.signingToken)
          // hash updateOtherUserTarget password
          return bcrypt.hash(updateOtherUserTarget.password, serverConfig.saltRounds)
        })
        .then(updateOtherUserTargetPasswordHash => {
          updateOtherUserTarget.password = updateOtherUserTargetPasswordHash
          // save updateOtherUserTarget account
          return Account.create(updateOtherUserTarget)
        })
        .then(savedUpdateOtherUserTarget => {
          updateOtherUserTarget.id = savedUpdateOtherUserTarget.id
          toDelete.push(updateOtherUserTarget.id)
          // hash updateOtherAdminTarget password
          return bcrypt.hash(updateOtherAdminTarget.password, serverConfig.saltRounds)
        })
        .then(updateOtherAdminTargetPasswordHash => {
          updateOtherAdminTarget.password = updateOtherAdminTargetPasswordHash
          // save updateOtherUserTarget account
          return Account.create(updateOtherAdminTarget)
        })
        .then(savedUpdateOtherAdminTarget => {
          updateOtherAdminTarget.id = savedUpdateOtherAdminTarget.id
          toDelete.push(updateOtherAdminTarget.id)
          // hash failUpdateSmallPassword password
          return bcrypt.hash(failUpdateSmallPassword.password, serverConfig.saltRounds)
        })
        .then(failUpdateSmallPasswordPasswordHash => {
          failUpdateSmallPassword.password = failUpdateSmallPasswordPasswordHash
          // save failUpdateSmallPassword account
          return Account.create(failUpdateSmallPassword)
        })
        .then(savedFailUpdateSmallPassword => {
          failUpdateSmallPassword.id = savedFailUpdateSmallPassword.id
          toDelete.push(failUpdateSmallPassword.id)
          failUpdateSmallPassword.accountType = userAccountType
          failUpdateSmallPasswordToken = TokenHandler.generateToken(failUpdateSmallPassword,
            serverConfig.signingToken)
          // hash failUpdateBigPassword password
          return bcrypt.hash(failUpdateBigPassword.password, serverConfig.saltRounds)
        })
        .then(failUpdateBigPasswordPasswordHash => {
          failUpdateBigPassword.password = failUpdateBigPasswordPasswordHash
          // save failUpdateBigPassword account
          log.info('saving biggy')
          return Account.create(failUpdateBigPassword)
        })
        .then(savedFailUpdateBigPassword => {
          failUpdateBigPassword.id = savedFailUpdateBigPassword.id
          toDelete.push(failUpdateBigPassword.id)
          failUpdateBigPassword.accountType = userAccountType
          failUpdateBigPasswordToken = TokenHandler.generateToken(failUpdateBigPassword,
            serverConfig.signingToken)
          done()
        })
        .catch(err => {
          log.warning(err.stack)
        })
    })

    it('should test that a user can update their own email', done => {
      let updatedEmail = 'updateselfuserupdated@account.website.com'

      chai.request(server)
        .put(accountsRoute + '/' + updateSelfUser.id)
        .set('Authorization', 'Bearer ' + updateSelfUserToken)
        .send({email: updatedEmail})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
          res.body.should.have.property('id')
          res.body.id.should.equal(updateSelfUser.id)
          res.body.should.have.property('email')
          res.body.email.should.equal(updatedEmail)
          updateSelfUser.email = updatedEmail
          res.body.should.have.property('username')
          res.body.username.should.equal(updateSelfUser.username)
          res.body.should.not.have.property('password')
          done()
        })
    })

    it('should test that a user can update their own password', done => {
      let updatedPassword = 'aNewPassword'

      chai.request(server)
        .put(accountsRoute + '/' + updateSelfUser.id)
        .set('Authorization', 'Bearer ' + updateSelfUserToken)
        .send({password: updatedPassword})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
            // after password is updated, get account
            // from db and compare new password
          Account.findOne({where: {email: updateSelfUser.email}})
            .then(account => {
              return bcrypt.compare(updatedPassword, account.password)
            }).then((passwordMatch) => {
              passwordMatch.should.equal(true)
              done()
            })
        })
    })

    it('should test that a user cannot change their own account type to admin', done => {
      let newAccountTypeId = adminAccountType.id

      chai.request(server)
        .put(accountsRoute + '/' + updateSelfUser.id)
        .set('Authorization', 'Bearer ' + updateSelfUserToken)
        .send({accountTypeId: newAccountTypeId})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
          res.body.should.have.property('accountTypeId')
          res.body.accountTypeId.should.equal(userAccountType.id)
          done()
        })
    })

    it('should test that an admin can update their own email', done => {
      let updatedEmail = 'updateselfadminupdated@account.website.com'

      chai.request(server)
        .put(accountsRoute + '/' + updateSelfAdmin.id)
        .set('Authorization', 'Bearer ' + updateSelfAdminToken)
        .send({email: updatedEmail})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
          res.body.should.have.property('id')
          res.body.id.should.equal(updateSelfAdmin.id)
          res.body.should.have.property('email')
          res.body.email.should.equal(updatedEmail)
          updateSelfAdmin.email = updatedEmail
          res.body.should.have.property('username')
          res.body.username.should.equal(updateSelfAdmin.username)
          res.body.should.not.have.property('password')
          done()
        })
    })

    it('should test that an admin can update their own password', done => {
      let updatedPassword = 'aNewPassword'

      chai.request(server)
        .put(accountsRoute + '/' + updateSelfAdmin.id)
        .set('Authorization', 'Bearer ' + updateSelfAdminToken)
        .send({password: updatedPassword})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
            // after password is updated, get account
            // from db and compare new password
          Account.findOne({where: {email: updateSelfAdmin.email}})
            .then((account) => {
              return bcrypt.compare(updatedPassword, account.password)
            }).then((passwordMatch) => {
              passwordMatch.should.equal(true)
              done()
            })
        })
    })

    it('should test that an admin cannot change their own account type to user', done => {
      let newAccountTypeId = userAccountType.id

      chai.request(server)
        .put(accountsRoute + '/' + updateSelfAdmin.id)
        .set('Authorization', 'Bearer ' + updateSelfAdminToken)
        .send({accountTypeId: newAccountTypeId})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(403)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.forbiddenErr)
          done()
        })
    })

    it('should test that an admin can change an admin\'s account type to user', done => {
      let newAccountTypeId = userAccountType.id

      chai.request(server)
        .put(accountsRoute + '/' + updateOtherAdminTarget.id)
        .set('Authorization', 'Bearer ' + updateOtherAdminToken)
        .send({accountTypeId: newAccountTypeId})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
          res.body.should.have.property('id')
          res.body.id.should.equal(updateOtherAdminTarget.id)
          res.body.should.have.property('accountTypeId')
          res.body.accountTypeId.should.equal(newAccountTypeId)
          updateOtherAdminTarget.accountTypeId = newAccountTypeId
          done()
        })
    })

    it('should test that an admin can change a user\'s account type to admin', done => {
      let newAccountTypeId = adminAccountType.id

      chai.request(server)
        .put(accountsRoute + '/' + updateOtherUserTarget.id)
        .set('Authorization', 'Bearer ' + updateOtherAdminToken)
        .send({accountTypeId: newAccountTypeId})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
          res.body.should.have.property('id')
          res.body.id.should.equal(updateOtherUserTarget.id)
          res.body.should.have.property('accountTypeId')
          res.body.accountTypeId.should.equal(newAccountTypeId)
          updateOtherUserTarget.accountTypeId = newAccountTypeId
          done()
        })
    })

    it('should test that an admin can update another account\'s email', done => {
      let newEmail = 'updateotheradmintargetupdated@account.website.com'

      chai.request(server)
        .put(accountsRoute + '/' + updateOtherAdminTarget.id)
        .set('Authorization', 'Bearer ' + updateOtherAdminToken)
        .send({email: newEmail})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
          res.body.should.have.property('id')
          res.body.id.should.equal(updateOtherAdminTarget.id)
          res.body.should.have.property('email')
          res.body.email.should.equal(newEmail)
          updateOtherAdminTarget.email = newEmail
          done()
        })
    })

    it('should test that an admin can update another account\'s password', done => {
      let newPassword = 'passwordNew'

      chai.request(server)
        .put(accountsRoute + '/' + updateOtherAdminTarget.id)
        .set('Authorization', 'Bearer ' + updateOtherAdminToken)
        .send({password: newPassword})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
            // after password is updated, get account
            // from db and compare new password
          Account.findOne({where: {email: updateOtherAdminTarget.email}})
            .then(account => {
              return bcrypt.compare(newPassword, account.password)
            }).then(passwordMatch => {
              passwordMatch.should.equal(true)
              done()
            })
        })
    })

    it('should test that a user cannot update another account\'s email', done => {
      let newEmail = 'updateotheradmintargetupdatedshouldfail@account.website.com'

      chai.request(server)
        .put(accountsRoute + '/' + updateOtherAdminTarget.id)
        .set('Authorization', 'Bearer ' + updateOtherUserToken)
        .send({email: newEmail})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
            // set new email if request was successful
          if (res.status === 200) {
            updateOtherAdminTarget.email = newEmail
          }
          res.status.should.equal(403)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.forbiddenErr)
          done()
        })
    })

    it('should test that a user cannot update another account\'s password', done => {
      let newPassword = 'moreUpdatedPw'

      chai.request(server)
        .put(accountsRoute + '/' + updateOtherAdminTarget.id)
        .set('Authorization', 'Bearer ' + updateOtherUserToken)
        .send({password: newPassword})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
            // set new email if request was successful
          if (res.status === 200) {
            updateOtherAdminTarget.password = newPassword
          }
          res.status.should.equal(403)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.forbiddenErr)
          done()
        })
    })

    it('should test that a logged out account cannot update another account\'s email', done => {
      let newEmail = 'haveifailedyet@account.website.com'

      chai.request(server)
        .put(accountsRoute + '/' + updateOtherAdminTarget.id)
        .send({email: newEmail})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
            // set new email if request was successful
          if (res.status === 200) {
            updateOtherAdminTarget.email = newEmail
          }
          res.status.should.equal(401)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.unauthorizedErr)
          done()
        })
    })

    it('should test that a logged out account cannot update another account\'s password', done => {
      let newPassword = 'passwordypassword'

      chai.request(server)
        .put(accountsRoute + '/' + updateOtherAdminTarget.id)
        .send({password: newPassword})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
            // set new email if request was successful
          if (res.status === 200) {
            updateOtherAdminTarget.password = newPassword
          }
          res.status.should.equal(401)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.unauthorizedErr)
          done()
        })
    })

    it('should test that a user cannot update email if the new email address is invalid', done => {
      let newEmail = 'potato'

      chai.request(server)
        .put(accountsRoute + '/' + updateSelfUser.id)
        .set('Authorization', 'Bearer ' + updateSelfUserToken)
        .send({email: newEmail})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.status === 200) {
            updateSelfUser.email = newEmail
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidEmailErr)
          done()
        })
    })

    it('should test that a user cannot update email if the new email address is already in use', done => {
      let newEmail = updateSelfAdmin.email

      chai.request(server)
        .put(accountsRoute + '/' + updateSelfUser.id)
        .set('Authorization', 'Bearer ' + updateSelfUserToken)
        .send({email: newEmail})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.status === 200) {
            updateSelfUser.email = newEmail
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal('Validation error')
          done()
        })
    })

    it('should test that a user cannot update a password if the new password is less than 4' +
      ' characters long', done => {
      let update = { password: '123' }

      chai.request(server)
        .put(accountsRoute + '/' + failUpdateSmallPassword.id)
        .set('Authorization', 'Bearer ' + failUpdateSmallPasswordToken)
        .send(update)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.body.id) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidPasswordErr)
          done()
        })
    })

    it('should test that an account fails to create when it contain\'s a password with more than ' +
      '24 characters', done => {
      let update = { password: '1234567890123456789012345' }

      chai.request(server)
        .put(accountsRoute + '/' + failUpdateBigPassword.id)
        .set('Authorization', 'Bearer ' + failUpdateBigPasswordToken)
        .send(update)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidPasswordErr)
          done()
        })
    })
  })

  describe('DELETE tests', () => {
        // delete self user // dont save this id, delete if test fails
    let deleteSelfUser = {
      email: 'deleteselfuser@account.website.com',
      username: 'deleteselfuser',
      password: 'deleteselfuser'
    }

    let deleteSelfUserToken = null
        // delete other user    // add this to toDelete list
    let deleteOtherUser = {
      email: 'deleteotheruser@account.website.com',
      username: 'deleteotheruser',
      password: 'deleteotheruser'
    }

    let deleteOtherUserToken = null
        // delete other user target // add this to toDelete list
    let deleteOtherUserTarget = {
      email: 'deleteotherusertarget@account.website.com',
      username: 'deleteotherusertarget',
      password: 'deleteotherusertarget'
    }

        // delete self admin  // dont save this id, delete if test fails
    let deleteSelfAdmin = {
      email: 'deleteselfadmin@account.website.com',
      username: 'deleteselfadmin',
      password: 'deleteselfadmin'
    }

    let deleteSelfAdminToken = null
        // delete other admin   // add this to toDelete list
    let deleteOtherAdmin = {
      email: 'deleteotheradmin@account.website.com',
      username: 'deleteotheradmin',
      password: 'deleteotheradmin'
    }

    let deleteOtherAdminToken = null
        // delete other admin target // dont save this id, delete if test fails
    let deleteOtherAdminTarget = {
      email: 'deleteotheradmintarget@account.website.com',
      username: 'deleteotheradmintarget',
      password: 'deleteotheradmintarget'
    }

        // deleteOtherTarget  (delete from not logged in)// add this to toDelete list
    let deleteOtherTarget = {
      email: 'deleteothertarget@account.website.com',
      username: 'deleteothertarget',
      password: 'deleteothertarget'
    }

    before(done => {
      deleteSelfUser.accountTypeId = userAccountType.id
      deleteOtherUser.accountTypeId = userAccountType.id
      deleteOtherUserTarget.accountTypeId = userAccountType.id
      deleteSelfAdmin.accountType = adminAccountType.id
      deleteOtherAdmin.accountTypeId = adminAccountType.id
      deleteOtherAdminTarget.accountTypeId = adminAccountType.id
      deleteOtherTarget.accountTypeId = userAccountType.id
            // hash deleteSelfUser password
      bcrypt.hash(deleteSelfUser.password, serverConfig.saltRounds)
        .then(deleteSelfUserPasswordHash => {
            // save deleteSelfUser account
          deleteSelfUser.password = deleteSelfUserPasswordHash
          return Account.create(deleteSelfUser)
        })
        .then(savedDeleteSelfUser => {
          deleteSelfUser.id = savedDeleteSelfUser.id
          deleteSelfUser.accountType = userAccountType
            // create deleteSelfUser token
          deleteSelfUserToken = TokenHandler.generateToken(deleteSelfUser,
                serverConfig.signingToken)
            // hash deleteOtherUser password
          return bcrypt.hash(deleteOtherUser.password, serverConfig.saltRounds)
        })
        .then(deleteOtherUserPasswordHash => {
            // save deleteOtherUser account
          deleteOtherUser.password = deleteOtherUserPasswordHash
          return Account.create(deleteOtherUser)
        })
        .then(savedDeleteOtherUser => {
          deleteOtherUser.id = savedDeleteOtherUser.id
          deleteOtherUser.accountType = userAccountType
            // add deleteOtherUser account id to delete list
          toDelete.push(deleteOtherUser.id)
            // create deleteOtherUser token
          deleteOtherUserToken = TokenHandler.generateToken(deleteOtherUser,
                serverConfig.signingToken)
            // hash deleteOtherUserTarget password
          return bcrypt.hash(deleteOtherUserTarget.password, serverConfig.saltRounds)
        })
        .then(deleteOtherUserTargetPasswordHash => {
            // save deleteOtherUserTarget account
          deleteOtherUserTarget.password = deleteOtherUserTargetPasswordHash
          return Account.create(deleteOtherUserTarget)
        })
        .then(savedDeleteOtherUserTarget => {
            // add deleteOtherUserTarget account id to delete list
          deleteOtherUserTarget.id = savedDeleteOtherUserTarget.id
          deleteOtherUserTarget.accountType = userAccountType
          toDelete.push(deleteOtherUserTarget.id)
            // hash deleteSelfAdmin password
          return bcrypt.hash(deleteSelfAdmin.password, serverConfig.saltRounds)
        })
        .then(deleteSelfAdminPasswordHash => {
          deleteSelfAdmin.password = deleteSelfAdminPasswordHash
            // save deleteSelfAdmin account
          return Account.create(deleteSelfAdmin)
        })
        .then(savedDeleteSelfAdmin => {
          deleteSelfAdmin.id = savedDeleteSelfAdmin.id
          deleteSelfAdmin.accountType = adminAccountType
          toDelete.push(deleteSelfAdmin.id)
            // create deleteSelfAdmin token
          deleteSelfAdminToken = TokenHandler.generateToken(deleteSelfAdmin,
                serverConfig.signingToken)
            // hash deleteOtherAdmin password
          return bcrypt.hash(deleteOtherAdmin.password, serverConfig.saltRounds)
        })
        .then(deleteOtherAdminPasswordHash => {
          deleteOtherAdmin.password = deleteOtherAdminPasswordHash
            // save deleteOtherAdmin account
          return Account.create(deleteOtherAdmin)
        })
        .then(savedDeleteOtherAdmin => {
          deleteOtherAdmin.id = savedDeleteOtherAdmin.id
          deleteOtherAdmin.accountType = adminAccountType
            // add deleteOtherAdmin account id to delete list
          toDelete.push(deleteOtherAdmin.id)
            // create deleteOtherAdmin token
          deleteOtherAdminToken = TokenHandler.generateToken(deleteOtherAdmin,
                serverConfig.signingToken)
            // hash deleteOtherAdminTarget password
          return bcrypt.hash(deleteOtherAdminTarget.password, serverConfig.saltRounds)
        })
        .then(deleteOtherAdminTargetPasswordHash => {
          deleteOtherAdminTarget.password = deleteOtherAdminTargetPasswordHash
            // save deleteOtherAdminTarget account
          return Account.create(deleteOtherAdminTarget)
        })
        .then(savedDeleteOtherAdminTarget => {
          deleteOtherAdminTarget.id = savedDeleteOtherAdminTarget.id
          deleteOtherAdminTarget.accountType = adminAccountType
            // add deleteOtherAdminTarget account id to delete list
          toDelete.push(deleteOtherAdminTarget.id)
            // hash deleteOtherTarget password
          return bcrypt.hash(deleteOtherTarget.password, serverConfig.saltRounds)
        })
        .then(deleteOtherTargetPasswordHash => {
          deleteOtherTarget.password = deleteOtherTargetPasswordHash
            // save deleteOtherTarget account
          return Account.create(deleteOtherTarget)
        })
        .then(savedDeleteOtherTarget => {
          deleteOtherTarget.id = savedDeleteOtherTarget.id
          deleteOtherTarget.accountType = userAccountType
            // add deleteOtherTarget account id to delete list
          toDelete.push(deleteOtherTarget.id)
          done()
        })
    })

    it('should test that a user can delete their own account', done => {
      chai.request(server)
        .delete(accountsRoute + '/' + deleteSelfUser.id)
        .set('Authorization', 'Bearer ' + deleteSelfUserToken)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.status !== 200 || !!err) {
            toDelete.push(deleteSelfUser.id)
          }
          res.status.should.equal(200)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.deletedAccountMsg)
          done()
        })
    })

    it('should test that a user cannot delete another account', done => {
      chai.request(server)
        .delete(accountsRoute + '/' + deleteOtherUserTarget.id)
        .set('Authorization', 'Bearer ' + deleteOtherUserToken)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(403)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.forbiddenErr)
          done()
        })
    })

    it('should test that an admin can delete another account', done => {
      chai.request(server)
        .delete(accountsRoute + '/' + deleteOtherAdminTarget.id)
        .set('Authorization', 'Bearer ' + deleteOtherAdminToken)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.status !== 200 || !!err) {
            toDelete.push(deleteOtherAdminTarget.id)
          }
          res.status.should.equal(200)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.deletedAccountMsg)
          done()
        })
    })

    it('should test that an admin cannot delete their own account', done => {
      chai.request(server)
        .delete(accountsRoute + '/' + deleteSelfAdmin.id)
        .set('Authorization', 'Bearer ' + deleteSelfAdminToken)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(403)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.forbiddenErr)
          done()
        })
    })

    it('should test that a logged out account cannot delete another account', done => {
      chai.request(server)
        .delete(accountsRoute + '/' + deleteOtherTarget.id)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(401)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.unauthorizedErr)
          done()
        })
    })
  })
})
