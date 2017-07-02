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
const Snippet = require('../models').Snippet
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
const snippetsRoute = '/api/snippets'

describe(snippetsRoute + ' tests', () => {
  let adminAccountToken = null
  let userAccountToken = null

  let userAccount = null
  let adminAccount = null

  let toDelete = []

  before(done => {
        // get an auth token for demo user
    Account.findOne({
      where: { username: 'DemoUser' },
      attributes: ['id', 'username', 'email'],
      include: [{ model: AccountType, as: 'accountType' }]
    })
      .then(account => {
        userAccount = account
        userAccountToken = TokenHandler.generateToken({
          id: account.id,
          username: account.username,
          email: account.email,
          accountType: account.accountType
        }, serverConfig.signingToken)
          // get an auth token for demo admin
        return Account.findOne({
          where: { username: 'DemoAdmin' },
          attributes: ['id', 'username', 'email'],
          include: [{ model: AccountType, as: 'accountType' }]
        })
      })
      .then(account => {
        adminAccount = account
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
    Snippet.destroy({ where: { id: { $in: toDelete } } })
      .then(count => {
        done()
      })
      .catch(err => {
        log.error('failed with: ' + err.message)
        done()
      })
  })

  describe('POST tests', () => {
        // create a snippet with admin for user to copy name/body
    let adminSnippet = {
      name: 'admin-snippet',
      body: 'body of admin snippet'
    }
        // create a snippet with user to test that copying name/body for a user is allowed
    let userSnippet = {
      name: 'user-snippet',
      body: 'body of user snippet'
    }

    before(done => {
      adminSnippet.authorId = adminAccount.id
      userSnippet.authorId = userAccount.id

      Snippet.create(userSnippet)
        .then(snippet => {
          userSnippet.id = snippet.id
          toDelete.push(userSnippet.id)
          return Snippet.create(adminSnippet)
        })
        .then(snippet => {
          adminSnippet.id = snippet.id
          toDelete.push(adminSnippet.id)
          done()
        })
        .catch(err => {
          log.error('failed with: ' + err.message)
          done()
        })
    })

    it('should test that a user can create a snippet', done => {
      let newUserSnippet = {
        authorId: userAccount.id,
        name: 'new-user-snippet',
        body: 'body of new user snippet'
      }

      chai.request(server)
        .post(snippetsRoute)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(newUserSnippet)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(200)
          res.body.should.have.property('id')
          toDelete.push(res.body.id)
          res.body.should.have.property('authorId')
          res.body.authorId.should.equal(newUserSnippet.authorId)
          res.body.should.have.property('name')
          res.body.name.should.equal(newUserSnippet.name)
          res.body.should.have.property('body')
          res.body.body.should.equal(newUserSnippet.body)
          done()
        })
    })

    it('should test that a user can create a snippet that shares a name with a snippet created ' +
    'by another user', done => {
      let shareNameSnippet = {
        authorId: userAccount.id,
        name: adminSnippet.name,
        body: 'body of share name snippet'
      }

      chai.request(server)
        .post(snippetsRoute)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(shareNameSnippet)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(200)
          res.body.should.have.property('id')
          toDelete.push(res.body.id)
          res.body.should.have.property('authorId')
          res.body.authorId.should.equal(shareNameSnippet.authorId)
          res.body.should.have.property('name')
          res.body.name.should.equal(shareNameSnippet.name)
          res.body.should.have.property('body')
          res.body.body.should.equal(shareNameSnippet.body)
          done()
        })
    })

    it('should test that a user can create a snippet that shares a body with a snippet created ' +
    'by another user', done => {
      let shareBodySnippet = {
        authorId: userAccount.id,
        name: 'share-body-snippet',
        body: adminSnippet.body
      }

      chai.request(server)
        .post(snippetsRoute)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(shareBodySnippet)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(200)
          res.body.should.have.property('id')
          toDelete.push(res.body.id)
          res.body.should.have.property('authorId')
          res.body.authorId.should.equal(shareBodySnippet.authorId)
          res.body.should.have.property('name')
          res.body.name.should.equal(shareBodySnippet.name)
          res.body.should.have.property('body')
          res.body.body.should.equal(shareBodySnippet.body)
          done()
        })
    })

    it('should test that a user cannot create a snippet that shares a name with another snippet' +
    ' created by that user', done => {
      let duplicateNameSnippet = {
        authorId: userAccount.id,
        name: userSnippet.name,
        body: 'body of duplicate name snippet'
      }

      chai.request(server)
        .post(snippetsRoute)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(duplicateNameSnippet)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          if (res.status === 200) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal('Validation error')
          done()
        })
    })

    it('should test that a user cannot create a snippet that shares a body with another snippet' +
    ' created by that user', done => {
      let duplicateBodySnippet = {
        authorId: userAccount.id,
        name: 'dup-body-snippet',
        body: userSnippet.body
      }

      chai.request(server)
        .post(snippetsRoute)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(duplicateBodySnippet)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          if (res.status === 200) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal('Validation error')
          done()
        })
    })

    it('should test that a user cannot create a snippet without a name', done => {
      let noNameSnippet = {
        authorId: userAccount.id,
        body: 'body of no name snippet'
      }

      chai.request(server)
        .post(snippetsRoute)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(noNameSnippet)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          if (res.status === 200) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.snippetNameMissingErr)
          done()
        })
    })

    it('should test that a user cannot create a snippet without a body', done => {
      let noBodySnippet = {
        authorId: userAccount.id,
        name: 'no-body-snippet'
      }

      chai.request(server)
        .post(snippetsRoute)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(noBodySnippet)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          if (res.status === 200) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.snippetBodyMissingErr)
          done()
        })
    })

    it('should test that a non logged in user can create a snippet for another account', done => {
      let otherAuthorSnippet = {
        authorId: userAccount.id,
        name: 'other-author-snippet',
        body: 'body of other author snippet'
      }

      chai.request(server)
        .post(snippetsRoute)
        .send(otherAuthorSnippet)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          if (res.status === 200) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(401)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.unauthorizedErr)
          done()
        })
    })

    it('should test that a user cannot create a snippet with a name containing more than 24' +
    'characters', done => {
      let longNameSnippet = {
        authorId: userAccount.id,
        name: '1234567890123456789012345',
        body: 'body of long name snippet'
      }

      chai.request(server)
        .post(snippetsRoute)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(longNameSnippet)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          if (res.status === 200) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidSnippetNameErr)
          done()
        })
    })

    it('should test that a user cannot create a snippet with a name containing less than 4 ' +
    'characters', done => {
      let smallNameSnippet = {
        authorId: userAccount.id,
        name: 'abc',
        body: 'body of small name snippet'
      }

      chai.request(server)
        .post(snippetsRoute)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(smallNameSnippet)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          if (res.status === 200) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidSnippetNameErr)
          done()
        })
    })

    it('should test that a user cannot create a snippet with a name containing spaces', done => {
      let spacesSnippet = {
        authorId: userAccount.id,
        name: 'a space',
        body: 'body of a space snippet'
      }

      chai.request(server)
        .post(snippetsRoute)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(spacesSnippet)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          if (res.status === 200) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidSnippetNameErr)
          done()
        })
    })

    it('should test that a user cannot create a snippet with a name containing illegal characters',
    done => {
      let illegalCharSnippet = {
        authorId: userAccount.id,
        name: '!?!$%^&;',
        body: 'body of illegal characters snippet'
      }

      chai.request(server)
        .post(snippetsRoute)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(illegalCharSnippet)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          if (res.status === 200) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidSnippetNameErr)
          done()
        })
    })

    it('should test that a user cannot create a snippet with a body that is larger than 10000 ' +
    'characters', done => {
      let bigBodySnippet = {
        authorId: userAccount.id,
        name: 'big-body',
        body: '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901'
      }

      chai.request(server)
        .post(snippetsRoute)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(bigBodySnippet)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          if (res.status === 200) {
            toDelete.push(res.body.id)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidSnippetBodyErr)
          done()
        })
    })
  })

  describe('GET tests', () => {
    let getByNameSnippet = {
      name: 'get_by_name_snippet',
      body: 'body of get by name snippet'
    }

    let getByIdSnippet = {
      name: 'get_by_id_snippet',
      body: 'body of get by id snippet'
    }

    let getByUserSnippet = {
      name: 'get-b-u-snippet',
      body: 'body of get by user snippet'
    }

    before(done => {
      getByNameSnippet.authorId = userAccount.id
      getByIdSnippet.authorId = userAccount.id
      getByUserSnippet.authorId = userAccount.id

      Snippet.create(getByNameSnippet)
        .then(snippet => {
          getByNameSnippet.id = snippet.id
          toDelete.push(getByNameSnippet.id)
          return Snippet.create(getByIdSnippet)
        })
        .then(snippet => {
          getByIdSnippet.id = snippet.id
          toDelete.push(getByIdSnippet.id)
          return Snippet.create(getByUserSnippet)
        })
        .then(snippet => {
          getByUserSnippet.id = snippet.id
          toDelete.push(getByUserSnippet.id)
          done()
        })
        .catch(err => {
          log.error('failed with: ' + err.message)
          done()
        })
    })

    it('should test get snippets', done => {
      Snippet.findAll({})
        .then(snippets => {
          let numSnippets = snippets.length

          chai.request(server)
            .get(snippetsRoute)
            .end((err, res) => {
              if (err) {
                log.error(`err:\n: ${err.message}`)
              }
              res.status.should.equal(200)
              res.body.should.have.property('snippets')
              res.body.snippets.should.be.a('array')
              res.body.snippets.length.should.equal(numSnippets)
              done()
            })
        })
    })

    it('should test get all snippets for a user', done => {
      Snippet.findAll({where: {authorId: userAccount.id}})
        .then(snippets => {
          let numSnippets = snippets.length

          chai.request(server)
            .get(snippetsRoute)
            .query({authorId: userAccount.id})
            .end((err, res) => {
              if (err) {
                log.error(`err:\n: ${err.message}`)
              }
              res.status.should.equal(200)
              res.body.should.have.property('snippets')
              res.body.snippets.should.be.a('array')
              res.body.snippets.length.should.equal(numSnippets)

              res.body.snippets.forEach(snippet => {
                snippet.should.have.property('authorId')
                snippet.authorId.should.equal(userAccount.id)
              })
              done()
            })
        })
    })

    it('should test get a snippet by id', done => {
      chai.request(server)
        .get(snippetsRoute + '/' + getByIdSnippet.id)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(200)
          let snippet = res.body
          snippet.should.have.property('id')
          snippet.id.should.equal(getByIdSnippet.id)
          snippet.should.have.property('name')
          snippet.name.should.equal(getByIdSnippet.name)
          snippet.should.have.property('authorId')
          snippet.authorId.should.equal(getByIdSnippet.authorId)
          done()
        })
    })

    it('should test get a snippet by name', done => {
      chai.request(server)
        .get(snippetsRoute)
        .query({name: getByNameSnippet.name})
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(200)
          res.body.should.have.property('snippets')
          res.body.snippets.should.be.a('array')
          res.body.snippets.length.should.equal(1)
          let snippet = res.body.snippets[0]
          snippet.should.have.property('id')
          snippet.id.should.equal(getByNameSnippet.id)
          snippet.should.have.property('name')
          snippet.name.should.equal(getByNameSnippet.name)
          snippet.should.have.property('authorId')
          snippet.authorId.should.equal(getByNameSnippet.authorId)
          done()
        })
    })

    it('should test that find one by id fails when given a bad id parameter', done => {
      chai.request(server)
        .get(snippetsRoute + '/999999999')
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(404)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.snippetNotFoundErr)
          done()
        })
    })

    it('should test that find one by id fails when given a non integer id parameter', done => {
      chai.request(server)
        .get(snippetsRoute + '/potato')
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(422)
          res.body.should.have.property('message')
          res.body.message.should.equal('invalid input syntax for integer: "potato"')
          done()
        })
    })

    it('should test that finding a username snippet works', done => {
      chai.request(server)
        .get(snippetsRoute + '/' + userAccount.username + '/' + getByUserSnippet.name)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(200)
          res.should.have.property('text')
          res.text.should.equal(getByUserSnippet.body)
          done()
        })
    })

    it('should test that finding a username snippet fails when snippet doesn\'t exist', done => {
      chai.request(server)
        .get(snippetsRoute + '/username/teppins')
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(404)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.snippetNotFoundErr)
          done()
        })
    })
    // TODO: count route tests
  })

  describe('PUT tests', () => {
    let updateOwnSnippet = {
      name: 'update_own-snippet',
      body: 'update own snippet body'
    }

    let failUpdateAuthorSnippet = {
      name: 'upd_author_snippet',
      body: 'update author snippet body'
    }

    let failUserUpdateOtherSnippet = {
      name: 'fail-u-upd-ot-snet',
      body: 'fail user update other snippet body'
    }

    let failAdminUpdateOtherSnippet = {
      name: 'fail-a-upd-ot-snet',
      body: 'fail admin update other snippet body'
    }

    let failLogoutUserUpdateOtherSnippet = {
      name: 'fail-lout-upd-ot-snippet',
      body: 'fail logout update other snippet body'
    }

    let failBigNameUpdateSnippet = {
      name: 'fail-bn-s',
      body: 'fail big name update snippet body'
    }

    let failSmallNameUpdateSnippet = {
      name: 'fail-sn-s',
      body: 'fail small name update snippet body'
    }

    let failNameSpacesUpdateSnippet = {
      name: 'fail-ns-s',
      body: 'fail name space update snippet body'
    }

    let failNameBadCharUpdateSnippet = {
      name: 'fail-bc-s',
      body: 'fail name bad char update snippet body'
    }

    let failBigBodyUpdateSnippet = {
      name: 'fail-bb-s',
      body: 'fail big body update snippet body'
    }

    before(done => {
      updateOwnSnippet.authorId = userAccount.id
      failUpdateAuthorSnippet.authorId = userAccount.id
      failUserUpdateOtherSnippet.authorId = adminAccount.id
      failAdminUpdateOtherSnippet.authorId = userAccount.id
      failLogoutUserUpdateOtherSnippet.authorId = userAccount.id
      failBigNameUpdateSnippet.authorId = userAccount.id
      failSmallNameUpdateSnippet.authorId = userAccount.id
      failNameSpacesUpdateSnippet.authorId = userAccount.id
      failNameBadCharUpdateSnippet.authorId = userAccount.id
      failBigBodyUpdateSnippet.authorId = userAccount.id

      Snippet.create(updateOwnSnippet)
        .then(snippet => {
          updateOwnSnippet.id = snippet.id
          toDelete.push(updateOwnSnippet.id)
          return Snippet.create(failUpdateAuthorSnippet)
        })
        .then(snippet => {
          failUpdateAuthorSnippet.id = snippet.id
          toDelete.push(failUpdateAuthorSnippet.id)
          return Snippet.create(failUserUpdateOtherSnippet)
        })
        .then(snippet => {
          failUserUpdateOtherSnippet.id = snippet.id
          toDelete.push(failUserUpdateOtherSnippet.id)
          return Snippet.create(failAdminUpdateOtherSnippet)
        })
        .then(snippet => {
          failAdminUpdateOtherSnippet.id = snippet.id
          toDelete.push(failAdminUpdateOtherSnippet.id)
          return Snippet.create(failLogoutUserUpdateOtherSnippet)
        })
        .then(snippet => {
          failLogoutUserUpdateOtherSnippet.id = snippet.id
          toDelete.push(failLogoutUserUpdateOtherSnippet.id)
          return Snippet.create(failBigNameUpdateSnippet)
        })
        .then(snippet => {
          failBigNameUpdateSnippet.id = snippet.id
          toDelete.push(failBigNameUpdateSnippet.id)
          return Snippet.create(failSmallNameUpdateSnippet)
        })
        .then(snippet => {
          failSmallNameUpdateSnippet.id = snippet.id
          toDelete.push(failSmallNameUpdateSnippet.id)
          return Snippet.create(failNameSpacesUpdateSnippet)
        })
        .then(snippet => {
          failNameSpacesUpdateSnippet.id = snippet.id
          toDelete.push(failNameSpacesUpdateSnippet.id)
          return Snippet.create(failNameBadCharUpdateSnippet)
        })
        .then(snippet => {
          failNameBadCharUpdateSnippet.id = snippet.id
          toDelete.push(failNameBadCharUpdateSnippet.id)
          return Snippet.create(failBigBodyUpdateSnippet)
        })
        .then(snippet => {
          failBigBodyUpdateSnippet.id = snippet.id
          toDelete.push(failBigBodyUpdateSnippet.id)
          done()
        })
        .catch(err => {
          log.error('failed with: ' + err.message)
          done()
        })
    })
    it('should test that a user can update their own snippet', done => {
      let update = {
        name: 'upd-update-own-snippet',
        body: 'updated update own snippet body'
      }

      chai.request(server)
        .put(snippetsRoute + '/' + updateOwnSnippet.id)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(update)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(200)
          res.body.should.have.property('id')
          res.body.id.should.equal(updateOwnSnippet.id)
          res.body.should.have.property('name')
          res.body.name.should.equal(update.name)
          res.body.should.have.property('body')
          res.body.body.should.equal(update.body)
          done()
        })
    })

    it('should test that a user cannot update another user\'s snippet', done => {
      let update = {
        name: 'upted-f-us-upd-ot-sntt',
        body: 'updated fail user update other snippet body'
      }

      chai.request(server)
        .put(snippetsRoute + '/' + failUserUpdateOtherSnippet.id)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(update)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(404)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.snippetNotFoundErr)
          done()
        })
    })

    it('should test that an admin cannot update another user\'s snippet', done => {
      let update = {
        name: 'rtrbww23',
        body: 'updated fail admin update other snippet body'
      }

      chai.request(server)
        .put(snippetsRoute + '/' + failAdminUpdateOtherSnippet.id)
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .send(update)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(404)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.snippetNotFoundErr)
          done()
        })
    })

    it('should test that a non logged in user cannot update another user\'s snippet', done => {
      let update = {
        name: 'het45wt',
        body: 'updated logout admin update other snippet body'
      }

      chai.request(server)
        .put(snippetsRoute + '/' + failLogoutUserUpdateOtherSnippet.id)
        .send(update)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(401)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.unauthorizedErr)
          done()
        })
    })

    it('should test that author id cannot be updated', done => {
      let update = { authorId: adminAccount.id }

      chai.request(server)
        .put(snippetsRoute + '/' + failUpdateAuthorSnippet.id)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(update)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(200)
          res.body.should.have.property('id')
          res.body.id.should.equal(failUpdateAuthorSnippet.id)
          res.body.should.not.property('authorId')
          done()
        })
    })

    it('should fail to update a snippet that doesn\'t exist', done => {
      let update = {
        name: 'does-not-exist-name',
        body: 'does not exist body'
      }

      chai.request(server)
        .put(snippetsRoute + '/999999999')
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(update)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(404)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.snippetNotFoundErr)
          done()
        })
    })

    it('should fail to update a snippet with a name with more than 24 characters', done => {
      let update = { name: '0987654321098765432155555' }

      chai.request(server)
        .put(snippetsRoute + '/' + failBigNameUpdateSnippet.id)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(update)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidSnippetNameErr)
          done()
        })
    })

    it('should fail to update a snippet with a name with less than 24 characters', done => {
      let update = { name: 'zjw' }

      chai.request(server)
        .put(snippetsRoute + '/' + failSmallNameUpdateSnippet.id)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(update)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidSnippetNameErr)
          done()
        })
    })

    it('should fail to update a snippet with a name that contains space characters', done => {
      let update = { name: 'has a space' }

      chai.request(server)
        .put(snippetsRoute + '/' + failNameSpacesUpdateSnippet.id)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(update)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidSnippetNameErr)
          done()
        })
    })

    it('should fail to update a snippet with a name that contains illegal character', done => {
      let update = { name: '(:;<)' }

      chai.request(server)
        .put(snippetsRoute + '/' + failNameBadCharUpdateSnippet.id)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(update)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidSnippetNameErr)
          done()
        })
    })

    it('should fail to update a snippet with a body that has more than 10 000 characters', done => {
      let update = {
        body: '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
        '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901'
      }

      chai.request(server)
        .put(snippetsRoute + '/' + failBigBodyUpdateSnippet.id)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .send(update)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(400)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.invalidSnippetBodyErr)
          done()
        })
    })
  })

  describe('DELETE tests', () => {
    let deleteOwnSnippet = {
      name: 'delete-own-snippet',
      body: 'delete own snippet body'
    }

    let userFailDeleteOtherSnippet = {
      name: 'w54gvt',
      body: 'user delete other snippet body'
    }

    let adminDeleteOtherUserSnippet = {
      name: '968o7b',
      body: 'admin delete other snippet body'
    }

    let loggedOutFailDeleteOtherSnippet = {
      name: '14v514f53',
      body: 'logged out fail delete other snippet body'
    }

    before(done => {
      deleteOwnSnippet.authorId = userAccount.id
      userFailDeleteOtherSnippet.authorId = adminAccount.id
      adminDeleteOtherUserSnippet.authorId = userAccount.id
      loggedOutFailDeleteOtherSnippet.authorId = userAccount.id

      Snippet.create(deleteOwnSnippet)
        .then(snippet => {
          deleteOwnSnippet.id = snippet.id
          return Snippet.create(userFailDeleteOtherSnippet)
        })
        .then(snippet => {
          userFailDeleteOtherSnippet.id = snippet.id
          toDelete.push(userFailDeleteOtherSnippet.id)
          return Snippet.create(adminDeleteOtherUserSnippet)
        })
        .then(snippet => {
          adminDeleteOtherUserSnippet.id = snippet.id
          toDelete.push(adminDeleteOtherUserSnippet.id)
          return Snippet.create(loggedOutFailDeleteOtherSnippet)
        })
        .then(snippet => {
          loggedOutFailDeleteOtherSnippet.id = snippet.id
          toDelete.push(loggedOutFailDeleteOtherSnippet.id)
          done()
        })
        .catch(err => {
          log.error('failed with: ' + err.message)
          done()
        })
    })

    it('should test that a user can delete their own snippet', done => {
      chai.request(server)
        .delete(snippetsRoute + '/' + deleteOwnSnippet.id)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .set('Content-type', 'application/json')
        .end((err, res) => {
          if (res.status !== 200 || err) {
            toDelete.push(deleteOwnSnippet.id)
          }
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(200)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.deletedSnippetMsg)
          done()
        })
    })

    it('should test that a user cannot delete another user\'s snippet', done => {
      chai.request(server)
        .delete(snippetsRoute + '/' + userFailDeleteOtherSnippet.id)
        .set('Authorization', 'Bearer ' + userAccountToken)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(404)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.snippetNotFoundErr)
          done()
        })
    })

    it('should test that an admin can delete another user\'s snippet', done => {
      chai.request(server)
        .delete(snippetsRoute + '/' + adminDeleteOtherUserSnippet.id)
        .set('Authorization', 'Bearer ' + adminAccountToken)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(200)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.deletedSnippetMsg)
          done()
        })
    })

    it('should test that a non logged in user cannot delete another user\'s snippet', done => {
      chai.request(server)
        .delete(snippetsRoute + '/' + loggedOutFailDeleteOtherSnippet.id)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(401)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.unauthorizedErr)
          done()
        })
    })

    it('should fail to delete a snippet that doesn\'t exist', done => {
      chai.request(server)
        .delete(snippetsRoute + '/999999999')
        .set('Authorization', 'Bearer ' + userAccountToken)
        .end((err, res) => {
          if (err) {
            log.error(`err:\n: ${err.message}`)
          }
          res.status.should.equal(404)
          res.body.should.have.property('message')
          res.body.message.should.equal(strings.snippetNotFoundErr)
          done()
        })
    })
  })
})
