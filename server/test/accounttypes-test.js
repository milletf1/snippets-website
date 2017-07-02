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
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../app')

chai.use(chaiHttp)
chai.should()
const log = new Log()
const accountTypesRoute = '/api/account-types'

describe(accountTypesRoute + ' tests', () => {
  let adminAccountToken = null
  let userAccountToken = null

  let UserAccountType = null
  let AdminAccountType = null

  let toDelete = []
  before(done => {
    // get account types,
    AccountType.findAll({})
      .then(accountTypes => {
        accountTypes.forEach(accountType => {
          if (accountType.name === 'User') {
            UserAccountType = accountType
          } else if (accountType.name === 'Admin') {
            AdminAccountType = accountType
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
      .catch(err => {
        log.error('failed with: ' + err.message)
        done()
      })
  })

  after(done => {
    AccountType.destroy({ where: { id: { $in: toDelete } } })
      .then(count => {
        done()
      })
      .catch(err => {
        log.error('failed with: ' + err.message)
        done()
      })
  })

  describe('POST tests', () => {
    it('should test an admin can create an account type', done => {
      let newAccountType = { name: 'Other' }

      chai.request(server)
        .post(accountTypesRoute)
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .send(newAccountType)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
          res.body.should.have.property('id')
          toDelete.push(res.body.id)
          res.body.should.have.property('name')
          res.body.name.should.equal(newAccountType.name)
          done()
        })
    })

    it('should test a user cannot create an account type', done => {
      let newAccountType = { name: 'Fail' }

      chai.request(server)
        .post(accountTypesRoute)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(newAccountType)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.status === 200) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(403)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.forbiddenErr)
          done()
        })
    })

    it('should test an admin cannot create an account type without a name', done => {
      chai.request(server)
        .post(accountTypesRoute)
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.status === 200) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.missingAccountTypeNameErr)
          done()
        })
    })

    it('should test that an account type fails to create when it\'s name is less than 4 ' +
    'characters in length', done => {
      let failName = {name: 'xyz'}

      chai.request(server)
        .post(accountTypesRoute)
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .send(failName)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.status === 200) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidAccountTypeNameErr)
          done()
        })
    })

    it('should test that an account type fails to create when it\'s name is more than 24 ' +
    'characters in length', done => {
      let failName = {name: '12334567890098765432112345'}

      chai.request(server)
        .post(accountTypesRoute)
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .send(failName)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.status === 200) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidAccountTypeNameErr)
          done()
        })
    })
    // TODO test for spaces
    // TODO test for illegal characters
  })

  describe('GET tests', () => {
    let getByIdAccountType = { name: 'IdType' }
    let getByNameAccountType = { name: 'NameType' }

    before(done => {
      AccountType.create(getByIdAccountType)
        .then(account => {
          getByIdAccountType.id = account.id
          toDelete.push(getByIdAccountType.id)
          return AccountType.create(getByNameAccountType)
        })
        .then(account => {
          getByNameAccountType.id = account.id
          toDelete.push(getByNameAccountType.id)
          done()
        })
        .catch(err => {
          log.error('failed with: ' + err.message)
          done()
        })
    })

    it('should test that get account types works', done => {
      AccountType.findAll({})
        .then(accountTypes => {
          let numAccountTypes = accountTypes.length

          chai.request(server)
            .get(accountTypesRoute)
            .end((err, res) => {
              if (err) {
                log.error('error:\n' + JSON.stringify(err))
              }
              res.status.should.equal(200)
              res.body.should.have.property('accountTypes')
              res.body.accountTypes.should.be.a('array')
              res.body.accountTypes.length.should.equal(numAccountTypes)
              done()
            })
        })
    })

    it('should test that get an account types by name works', done => {
      chai.request(server)
        .get(accountTypesRoute)
        .query({name: getByNameAccountType.name})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
          res.body.should.have.property('accountTypes')
          res.body.accountTypes.should.be.a('array')
          res.body.accountTypes.length.should.be.eql(1)
          let getAccountType = res.body.accountTypes[0]
          getAccountType.name.should.equal(getByNameAccountType.name)
          getAccountType.id.should.equal(getByNameAccountType.id)
          done()
        })
    })

    it('should test that get an account types by id works', done => {
      chai.request(server)
        .get(accountTypesRoute + '/' + getByIdAccountType.id)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
          res.body.should.have.property('id')
          res.body.id.should.equal(getByIdAccountType.id)
          res.body.should.have.property('name')
          res.body.name.should.equal(getByIdAccountType.name)
          done()
        })
    })

    it('should test that find one by id fails when given a bad id parameter', done => {
      chai.request(server)
        .get(accountTypesRoute + '/999999999')
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(404)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.accountTypeNotFoundErr)
          done()
        })
    })

    it('should test that find one by id fails when given a non integer id parameter', done => {
      chai.request(server)
        .get(accountTypesRoute + '/potato')
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal('column "nan" does not exist')
          done()
        })
    })
  })

  describe('PUT tests', () => {
    let updateAccountType = { name: 'UpdateAccountType' }
    let doNotUpdateAccountType = { name: 'DoNotUpdateAType' }
    let updateSharedNameAccountFirst = { name: 'UpdateSharedNAFirst' }
    let updateSharedNameAccountSecond = { name: 'UpdateSharedNASecond' }
    let failUpdateSmallName = { name: 'FailUpdateSmallName' }
    let failUpdateBigName = { name: 'FailUpdateBigName' }

    before(done => {
      AccountType.create(updateAccountType)
        .then(accountType => {
          updateAccountType.id = accountType.id
          toDelete.push(updateAccountType.id)
          return AccountType.create(doNotUpdateAccountType)
        })
        .then(accountType => {
          doNotUpdateAccountType.id = accountType.id
          toDelete.push(doNotUpdateAccountType.id)
          return AccountType.create(updateSharedNameAccountFirst)
        })
        .then(accountType => {
          updateSharedNameAccountFirst.id = accountType.id
          toDelete.push(updateSharedNameAccountFirst.id)
          return AccountType.create(updateSharedNameAccountSecond)
        })
        .then(accountType => {
          updateSharedNameAccountSecond.id = accountType.id
          toDelete.push(updateSharedNameAccountSecond.id)
          return AccountType.create(failUpdateSmallName)
        })
        .then(accountType => {
          failUpdateSmallName.id = accountType.id
          toDelete.push(failUpdateSmallName.id)
          return AccountType.create(failUpdateBigName)
        })
        .then(accountType => {
          failUpdateBigName.id = accountType.id
          toDelete.push(failUpdateBigName.id)
          done()
        })
        .catch(err => {
          log.error('failed with: ' + err.message)
          done()
        })
    })

    it('should test that an admin can update an account type', done => {
      let updateAccountTypeName = 'UpdateNewName'

      chai.request(server)
        .put(accountTypesRoute + '/' + updateAccountType.id)
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .send({name: updateAccountTypeName})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(200)
          res.body.should.have.property('id')
          res.body.id.should.equal(updateAccountType.id)
          res.body.should.have.property('name')
          res.body.name.should.equal(updateAccountTypeName)
          updateAccountType.name = updateAccountTypeName
          done()
        })
    })

    it('should test that a user cannot update an account type', done => {
      let doNotUpdateAccountTypeName = 'DoNotUpdateAccountTypeNewName'

      chai.request(server)
        .put(accountTypesRoute + '/' + doNotUpdateAccountType.id)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send({name: doNotUpdateAccountTypeName})
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

    it('should test that an admin cannot update an account type that doesn\'t exist', done => {
      let someName = 'SomeTypeName'

      chai.request(server)
        .put(accountTypesRoute + '/999999999')
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .send({name: someName})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(404)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.accountTypeNotFoundErr)
          done()
        })
    })

    it('should test that an admin cannot update an account type with a name that already exists',
    done => {
      chai.request(server)
        .put(accountTypesRoute + '/' + updateSharedNameAccountFirst.id)
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .send({name: updateSharedNameAccountSecond.name})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.body.should.have.property('message')
          res.body.message.should.equal('Validation error')
          res.status.should.equal(422)
          done()
        })
    })

    it('should test that an admin cannot update the user account type', done => {
      chai.request(server)
        .put(accountTypesRoute + '/' + UserAccountType.id)
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .send({name: 'UserAccountTypeUPDATE'})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.accountTypeNotFoundErr)
          res.status.should.equal(404)
          done()
        })
    })

    it('should test that an admin cannot update the admin account type', done => {
      chai.request(server)
        .put(accountTypesRoute + '/' + AdminAccountType.id)
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .send({name: 'AdminAccountTypeUPDATE'})
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(404)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.accountTypeNotFoundErr)
          done()
        })
    })

    it('should test that an account type fails to update when it\'s name is less than 4 ' +
    'characters in length', done => {
      let failName = {name: 'bgb'}

      chai.request(server)
        .put(accountTypesRoute + '/' + failUpdateSmallName.id)
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .send(failName)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidAccountTypeNameErr)
          done()
        })
    })

    it('should test that an account type fails to update when it\'s name is more than 24 ' +
    'characters in length', done => {
      let failName = {name: '12312345345678900987654321'}

      chai.request(server)
        .put(accountTypesRoute + '/' + failUpdateBigName.id)
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .send(failName)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidAccountTypeNameErr)
          done()
        })
    })

    // TODO test for spaces
    // TODO test for illegal characters
  })

  describe('DELETE tests', () => {
    let deleteAccountType = { name: 'deleteAccountType' }
    let doNotDeleteAccountType = { name: 'doNotDeleteAccountType' }
    let doNotDeleteOtherType = { name: 'doNotDeleteOtherType' }

    before(done => {
      AccountType.create(deleteAccountType)
        .then(account => {
          deleteAccountType.id = account.id
          return AccountType.create(doNotDeleteAccountType)
        })
        .then(account => {
          doNotDeleteAccountType.id = account.id
          toDelete.push(doNotDeleteAccountType.id)
          return AccountType.create(doNotDeleteOtherType)
        })
        .then(account => {
          doNotDeleteOtherType.id = account.id
          toDelete.push(doNotDeleteOtherType.id)
          done()
        })
        .catch(err => {
          log.error('failed with: ' + JSON.stringify(err))
          done()
        })
    })

    it('should test that an admin can delete an account type', done => {
      chai.request(server)
        .delete(accountTypesRoute + '/' + deleteAccountType.id)
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          if (res.status !== 200) {
            toDelete.push(deleteAccountType.id)
          }
          res.status.should.equal(200)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.deletedAccountTypeMsg)
          done()
        })
    })

    it('should test that a user cannot delete an account type', done => {
      chai.request(server)
        .delete(accountTypesRoute + '/' + doNotDeleteAccountType.id)
        .set('Authorization', 'Bearer ' + userAccountToken)
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

    it('should test that an account type cannot be deleted by a logged out account', done => {
      chai.request(server)
        .delete(accountTypesRoute + '/' + doNotDeleteOtherType.id)
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

    it('should test that an admin cannot delete an account type that doesn\'t exist', done => {
      chai.request(server)
        .delete(accountTypesRoute + '/999999999')
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(404)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.accountTypeNotFoundErr)
          done()
        })
    })

    it('should test that an admin cannot delete the user account type', done => {
      chai.request(server)
        .delete(accountTypesRoute + '/' + UserAccountType.id)
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(404)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.accountTypeNotFoundErr)
          done()
        })
    })

    it('should test that an admin cannot delete the admin account type', done => {
      chai.request(server)
        .delete(accountTypesRoute + '/' + AdminAccountType.id)
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .end((err, res) => {
          if (err) {
            log.error('error:\n' + JSON.stringify(err))
          }
          res.status.should.equal(404)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.accountTypeNotFoundErr)
          done()
        })
    })
  })
})
