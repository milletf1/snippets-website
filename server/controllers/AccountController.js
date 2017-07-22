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
 * Account API controller.
 * @author Tim Miller
 */
const bcrypt = require('bcrypt')
const Log = require('log')

const Account = require('../models').Account
const AccountType = require('../models').AccountType
const Snippet = require('../models').Snippet
const serverConfig = require('../config')
const TokenHandler = require('../modules/TokenHandler')
const Utils = require('../modules/Utils')
const strings = require('../config/strings')

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const usernameRegex = /^([a-zA-Z0-9_-]{1,16})$/
const passwordMinLen = 4
const passwordMaxLen = 24
const log = new Log()

/**
 * Decodes and returns an authorization header token's contents
 *
 * @param {object} headers - request headers
 * @returns {object} authorization header token contents
 */
const getTokenContents = (headers) => {
  let token = Utils.getToken(headers)
  return TokenHandler.decodeToken(token, serverConfig.signingToken)
}

/**
 * @api {post} /api/accounts/user Create user account
 * @apiVersion 0.1.0
 * @apiName CreateUserAccount
 * @apiGroup Account
 *
 * @apiParam {String} username  Account username.
 * @apiParam {String} email  Email of account.
 *
 * @apiSuccess {Object} account Newly created account.
 * @apiSuccess {String} token Authorization token for new account.
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'account': {
 *        'username': 'some-guy',
 *        'email': 'someguy@someplace.com',
 *      },
 *      'token': '<an authorization token>'
 *    }
 *
 * @apiError ForbiddenUsername A forbidden username was found in the post request body.
 * @apiErrorExample ForbiddenUsername Response
 *     HTTP/1.1 422 ForbiddenUsername
 *     {
 *       'message': 'Cannot create an account with this username'
 *     }
 *
 * @apiError AccountExists An account exists that shares either an email address or username
 * with the values in the post request body.
 * @apiErrorExample AccountExists Response
 *     HTTP/1.1 422 AccountExists
 *     {
 *       'message': 'This account already exists'
 *     }
 */
const createUser = (req, res) => {
    // prevent user from creating an account with the username 'count' (it breaks /api/snippets/count routes)
  if (req.body.username === 'count') {
    return res.status(422).send({message: strings.forbiddenUsernameErr})
  }

  let options = getFindAccountOptions(req.body)
  let resAccount = {}
  let verifyCode = null

  return Account.findAll(options)
    .then(accounts => {
      if (accounts.length > 0) {
        res.status(422).send({message: strings.accountExistsErr})
        return
      }
      return createAccount(req.body, 'User')
    })
    .then(account => {
      if (account) {
        switch (process.env.NODE_ENV) {
          case 'prod':
            log.info('send email instead')
            return res.status(200).send({message: 'an account verification email has been sent'})
            break
          case 'dev':
          case 'test':
          default:
            resAccount.id = account.id
            resAccount.username = account.username
            resAccount.email = account.email
            verifyCode = account.verifyCode
            return AccountType.findOne({where: {id: account.accountTypeId}})
            break
        }
      }
    })
    .then((accountType) => {
      if (accountType && accountType.name) {
        resAccount.accountType = accountType
        let token = TokenHandler.generateToken(resAccount, serverConfig.signingToken)
        return res.status(200).send({
          account: resAccount,
          token: token,
          verifyCode: verifyCode
        })
      }
    })
    .catch(err => {
      let errRes = { message: err.message }
      log.error(`AccountController.createUser: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

/**
 * @api {post} /api/accounts/admin Create admin account
 * @apiVersion 0.1.0
 * @apiName CreateAdminAccount
 * @apiGroup Account
 *
 * @apiHeader Authorization Authorization token.
 * @apiHeaderExample Authorization Header
 * 'Authorization': 'Bearer <authorization token>'
 *
 * @apiParam {String} username  Account username.
 * @apiParam {String} email  Email of account.
 *
 * @apiSuccess {Object} account Newly created account.
 * @apiSuccess {String} token  Authorization token for new account.
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'account': {
 *        'id': 1
 *        'username': 'some-guy',
 *        'email': 'someguy@someplace.com',
 *        'accountTypeId': 1
 *      },
 *      'token': '<an authorization token>'
 *    }
 *
 * @apiError ForbiddenUsername A forbidden username was found in the post request body.
 * @apiErrorExample ForbiddenUsername Response
 *     HTTP/1.1 422 ForbiddenUsername
 *     {
 *       'message': 'Cannot create an account with this username'
 *     }
 *
 * @apiError AccountExists An account exists that shares either an email address or username
 * with the values in the post request body.
 *
 * @apiErrorExample AccountExists Response
 *     HTTP/1.1 422 AccountExists
 *     {
 *       'message': 'This account already exists'
 *     }
 *
 * @apiError TokenExpired Authorization token has expired.
 * @apiErrorExample TokenExpired Response
 *     HTTP/1.1 401 TokenExpired
 *     {
 *       'message': 'Jwt expired'
 *     }
 *
 * @apiError Unauthorized Api request does not have authorization to create an admin account.
 * @apiErrorExample Unauthorized Response
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       'message': 'Unauthorized'
 *     }
 *
 * @apiError Forbidden Account making api request is not an admin account.
 * @apiErrorExample Forbidden Response
 *     HTTP/1.1 403 Forbidden
 *     {
 *       'message': 'Forbidden'
 *     }
 */
const createAdmin = (req, res) => {
  if (req.body.username === 'count') {
    return res.status(422).send({message: strings.forbiddenUsernameErr})
  }

  let tokenContents = null
  try {
    tokenContents = getTokenContents(req.headers)
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send({message: err.message})
    } else {
      return res.status(401).send({message: strings.unauthorizedErr})
    }
  }
  if (tokenContents.account.accountType.name !== 'Admin') {
    return res.status(403).send({message: strings.forbiddenErr})
  }

  let options = getFindAccountOptions(req.body)

  return Account.findAll(options)
    .then(accounts => {
      if (accounts.length > 0) {
        return res.status(422).send({message: strings.accountExistsErr})
      }
      return createAccount(req.body, 'Admin')
    })
    .then(account => {
      if (account) {
        let resAccount = {
          id: account.id,
          username: account.username,
          email: account.email
        }
        return res.status(200).send(resAccount)
      }
    })
    .catch((err) => {
      let errRes = { message: err.message }
      log.error(`AccountController.createAdmin: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

/**
 * Extracts account fields from request body, hashes password,
 * then returns a new account instance.
 *
 * @param {Object} params - express request body.
 * @param {String} accountTypeName - name of account type to create.
 *
 * @returns {Object} A newly created account.
 */
const createAccount = (params, accountTypeName) => {
  let account = parseCreateRequest(params)

  return bcrypt.hash(params.password, serverConfig.saltRounds)
    .then(hash => {
      account.password = hash
      return AccountType.findOne({where: {name: accountTypeName}, attributes: ['id']})
    })
    .then(accountType => {
      account.accountTypeId = accountType.id
      if (accountTypeName === 'User') {
        account.isVerified = false
      }
      account.verifyCode = 'codeplaceholder'
      account.verifySentDate = new Date()
      return Account.create(account)
    })
}

/**
 * Parses and validates request body of POST request.
 *
 * @param {Object} reqBody POST request body.
 *
 * @throws {Error} An error will be thrown if reqBody doesn't contain an email attribute.
 * @throws {Error} An error will be thrown if reqBody doesn't contain a username attribute.
 * @throws {Error} An error will be thrown if reqBody doesn't contain a password attribute.
 * @throws {Error} An error will be thrown if email fails regex test.
 * @throws {Error} An error will be thrown if username fails a regex test.
 * @throws {Error} An error will be thrown if password is not between 4 and 24 characters long.
 *
 * @return {Object} A JSON object that contains values for creating a new account.
 */
const parseCreateRequest = (reqBody) => {
  if (!reqBody.email) {
    throw new Error(strings.missingEmailErr)
  }
  if (!reqBody.username) {
    throw new Error(strings.missingUsernameErr)
  }
  if (!reqBody.password) {
    throw new Error(strings.missingPasswordErr)
  }
  let email = reqBody.email
  let username = reqBody.username
  let password = reqBody.password

  if (!emailRegex.test(email)) {
    throw new Error(strings.invalidEmailErr)
  }
  if (!usernameRegex.test(username)) {
    throw new Error(strings.invalidUsernameErr)
  }

  if (password.length < passwordMinLen ||
    password.length > passwordMaxLen) {
    throw new Error(strings.invalidPasswordErr)
  }
  return {
    email: email,
    username: username,
    password: password
  }
}

/**
 * Returns query parameters to find an account.
 *
 * @param {Object} body Request body that contain find parameters.
 *
 * @returns {Object} Sequelize query parameters for finding an account.
 */
const getFindAccountOptions = (body) => {
  return {where: { $or: [
        {email: body.email},
        {username: body.username}
  ]}}
}

/**
 * @api {put} /api/accounts/:id Update account
 * @apiVersion 0.1.0
 * @apiName UpdateAccount
 * @apiGroup Account
 *
 * @apiHeader Authorization Authorization token.  Must belong to the account that is getting
 * updated, or an admin account.
 * @apiHeaderExample Authorization Header
 * 'Authorization': 'Bearer <authorization token>'
 *
 * @apiParam {Integer} id Id of account to update.
 * @apiParam {String} email Updated email address.
 * @apiParam {Integer} accountTypeId Updated account type id.  This parameter is restricted to
 * admin account.
 *
 * @apiSuccess {Integer} id Id of updated account.
 * @apiSuccess {String} username Username of updated account.
 * @apiSuccess {String} email Email address of updated account.
 * @apiSuccess {Integer} accountTypeId Id of updated account's account type.
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'id': 1
 *      'username': 'some-guy',
 *      'email': 'someguy@someplace.com',
 *      'accountTypeId': 1
 *    }
 *
 * @apiError TokenExpired Authorization token has expired.
 *
 * @apiErrorExample TokenExpired Response
 *     HTTP/1.1 422 TokenExpired
 *     {
 *       'message': 'Jwt expired'
 *     }
 *
 * @apiError Unauthorized Api request does not have authorization to update the account.
 * @apiErrorExample Unauthorized Response
 *     HTTP/1.1 422 Unauthorized
 *     {
 *       'message': 'Unauthorized'
 *     }
 *
 * @apiError Forbidden Account making api request is not an administrative account, the account
 * referenced by the id parameter, or a user account trying to change its own account type to
 * admin.
 * @apiErrorExample Forbidden Response
 *     HTTP/1.1 422 Forbidden
 *     {
 *       'message': 'Forbidden'
 *     }
 */
const update = (req, res) => {
  let id = parseInt(req.params.id)

  // check user permissions
  let tokenContents = null
  try {
    tokenContents = getTokenContents(req.headers)
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send({message: err.message})
    } else {
      return res.status(401).send({message: strings.unauthorizedErr})
    }
  }
  // prevent a user account from updating another account
  if (tokenContents.account.accountType.name !== 'Admin' &&
        tokenContents.account.id !== id) {
    return res.status(403).send({message: strings.forbiddenErr})
  }

  let update = {}
  if (req.body.email) {
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).send({message: strings.invalidEmailErr})
    } else {
      update.email = req.body.email
    }
  }
  if (!!req.body.accountTypeId && tokenContents.account.accountType.name === 'Admin') {
    if (tokenContents.account.id !== id) {
      update.accountTypeId = req.body.accountTypeId
    } else {
      return res.status(403).send({message: strings.forbiddenErr})
    }
  }

  let where = {where: {id: id}}
  let updatePromise = null

  if (req.body.password) {
    let password = req.body.password

    if (password.length < passwordMinLen ||
      password.length > passwordMaxLen) {
      return res.status(400).send({message: strings.invalidPasswordErr})
    }
    updatePromise = updateAccountIncludePassword(update, password, where)
  } else {
    updatePromise = updateAccount(update, where)
  }

  return updatePromise
    .then(update => {
      res.status(200).send(update)
    })
    .catch(err => {
      let errRes = { message: err.message }
      log.error(`AccountController.update: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

/**
 * Hashes a password, then updates an account.
 *
 * @param {Object} update - Account update details.
 * @param {String} password - Password to hash for update.
 * @param {Object} where - Details of account to update.
 *
 * @returns {Object} A promise to update an account.
 */
const updateAccountIncludePassword = (update, password, where) => {
  return bcrypt.hash(password, serverConfig.saltRounds)
    .then(hash => {
      update.password = hash
      return updateAccount(update, where)
    })
}

/**
 * Updates an account.
 *
 * @param {Object} update - Account update details.
 * @param {Object} where - Details of account to update.
 *
 * @returns {Object} A promise to update an account.
 */
const updateAccount = (update, where) => {
  return Account.update(update, where)
    .then(() => {
      where.attributes = ['id', 'accountTypeId', 'email', 'username']
      return Account.findOne(where)
    })
}

/**
 * @api {delete} /api/accounts/:id Delete an account
 * @apiVersion 0.1.0
 * @apiName DeleteAccount
 * @apiGroup Account
 *
 * @apiHeader Authorization Authorization token. Must belong to either the account that will be deleted,
 * or an admin account.
 * @apiHeaderExample Authorization Header
 * 'Authorization': 'Bearer <authorization token>'
 *
 * @apiParam {integer} id Id of account to delete.
 *
 * @apiSuccess {String} message Message to inform user that account has been deleted.
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'message': 'Account has been deleted'
 *    }
 *
 * @apiError TokenExpired Authorization token has expired.
 *
 * @apiErrorExample TokenExpired Response
 *     HTTP/1.1 401 TokenExpired
 *     {
 *       'message': 'Jwt expired'
 *     }
 *
 * @apiError Unauthorized Api request does not have authorization to delete the account.
 * @apiErrorExample Unauthorized Response
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       'message': 'Unauthorized'
 *     }
 *
 * @apiError Forbidden Account making api request is not an admin account or the account
 * that will be deleted.
 * @apiErrorExample Forbidden Response
 *     HTTP/1.1 403 Forbidden
 *     {
 *       'message': 'Forbidden'
 *     }
 *
 * @apiError NotFound Account to delete was not found.
 * @apiErrorExample NotFound Response
 *     HTTP/1.1 404 NotFound
 *     {
 *       'message': 'Account was not found'
 *     }
 */
const remove = (req, res) => {
  let id = parseInt(req.params.id)
  let tokenContents = null

  try {
    tokenContents = getTokenContents(req.headers)
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send({message: err.message})
    } else {
      return res.status(401).send({message: strings.unauthorizedErr})
    }
  }
    // prevent a non admin user from deleting another account
  if (tokenContents.account.accountType.name !== 'Admin' &&
        tokenContents.account.id !== id) {
    return res.status(403).send({message: strings.forbiddenErr})
    // prevent an admin from deleting their own account
  } else if (tokenContents.account.accountType.name === 'Admin' &&
        tokenContents.account.id === id) {
    return res.status(403).send({message: strings.forbiddenErr})
  }

  let options = {where: {id: id}}

  return Account.destroy(options)
    .then(count => {
      if (count === 1) {
        return res.status(200).send({message: strings.deletedAccountMsg})
      } else {
        return res.status(404).send({message: strings.accountNotFoundErr})
      }
    })
    .catch(err => {
      let errRes = { message: err.message }
      log.error(`AccountController.remove: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

/**
 * Creates and returns a promise to find accounts.
 *
 * @param {Object} query GET parameters.
 *
 * @return {Object} A promise to get query parameters to find accounts.
 */
const createFindPromise = (query) => {
  let findPromise = new Promise((resolve, reject) => {
    let options = {
      attributes: ['id', 'accountTypeId', 'email', 'username'],
      limit: serverConfig.limitCap,
      offset: 0
    }

    if (!query) {
      resolve(options)
    }
    options.where = { $and: {} }
    options.include = []

    if (query.include) {
      let queryIncludes = query.include.split(',')

      queryIncludes.forEach(include => {
        if (include.toLowerCase() === 'snippets') {
          options.include.push({
            model: Snippet,
            as: 'snippets'
          })
        } else if (include.toLowerCase() === 'accounttype') {
          options.include.push({
            model: AccountType,
            as: 'accountType'
          })
        }
      })
    }

    if (query.limit) {
      let limit = parseInt(query.limit)
      if (Number.isInteger(limit)) {
        options.limit = Math.min(serverConfig.limitCap, limit)
      }
    }

    if (query.offset) {
      let offset = parseInt(query.offset)
      if (Number.isInteger(offset)) {
        options.offset = offset
      }
    }

    if (query.id) {
      options.where.$and.id = query.id
    }

    if (query.accountTypeId) {
      options.where.$and.accountTypeId = query.accountTypeId
    }

    if (query.authorId) {
      options.where.$and.id = query.authorId
    }

    if (query.username) {
      options.where.$and.username = query.username
    }

    if (query.email) {
      options.where.$and.email = query.email
    }
    resolve(options)
  })
  return findPromise
}

/**
 * @api {get} /api/accounts Find accounts
 * @apiVersion 0.1.0
 * @apiName FindAccounts
 * @apiGroup Account
 *
 * @apiParam {Integer} [id] Id of account.
 * @apiParam {Integer} [accountTypeId] Find accounts that are of the account type referenced by
 * accountTypeId.
 * @apiParam {String} [email] Find accounts that have an email like the email query.
 * @apiParam {String} [username] Find accounts that have a username like username query.
 * @apiParam {String} [include] Include data that belongs to an account.  Include  can be either
 * 'snippets' or 'accounttype'.
 * @apiParam {Integer} [limit] Return a limited number of accounts (maximum of 25).
 * @apiParam {Integer} [offset] Return results from the position specified by offset.
 *
 * @apiSuccess {Array} accounts Accounts that where found by request.
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'accounts': [
 *        {
 *          'id': 1
 *          'username': 'some-guy',
 *          'email': 'someguy@someplace.com',
 *          'accountTypeId': 1
 *        },
 *        <other accounts>
 *      ]
 *    }
 */
const find = (req, res) => {
  return createFindPromise(req.query)
    .then(options => {
      return Account.findAll(options)
    })
    .then(accounts => {
      return res.status(200).send({accounts: accounts})
    })
    .catch((err) => {
      let errRes = { message: err.message }
      log.error(`AccountController.find: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

/**
 * @api {get} /api/accounts/:id Find an account
 * @apiVersion 0.1.0
 * @apiName FindAccount
 * @apiGroup Account
 *
 * @apiParam {integer} id Id of account.
 *
 * @apiSuccess {integer} id Id of found account.
 * @apiSuccess {String} username Username of found account.
 * @apiSuccess {String} email Email address of found account.
 * @apiSuccess {integer} accountTypeId Id of found account's account type.
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'id': 1
 *      'username': 'some-guy',
 *      'email': 'someguy@someplace.com',
 *      'accountTypeId': 1
 *    }
 *
 * @apiError NotFound Account was not found.
 * @apiErrorExample NotFound Response
 *     HTTP/1.1 404 NotFound
 *     {
 *       'message': 'Account was not found'
 *     }
 */
const findOne = (req, res) => {
  let options = {
    where: {
      id: req.params.id
    },
    attributes: [
      'id',
      'accountTypeId',
      'email',
      'username'
    ]
  }

  return Account.findOne(options)
    .then(account => {
      if (account) {
        return res.status(200).send(account)
      } else {
        return res.status(404).send({message: strings.accountNotFoundErr})
      }
    })
    .catch(err => {
      let errRes = { message: err.message }
      log.error(`AccountController.findOne: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

module.exports = {
  createUser: createUser,
  createAdmin: createAdmin,
  update: update,
  remove: remove,
  find: find,
  findOne: findOne
}
