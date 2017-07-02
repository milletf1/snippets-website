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
 * Account Type API controller.
 * @author Tim Miller
 */
const Log = require('log')

const AccountType = require('../models').AccountType
const serverConfig = require('../config')
const strings = require('../config/strings')
const TokenHandler = require('../modules/TokenHandler')
const Utils = require('../modules/Utils')

const accountTypeNameRegex = /^([a-zA-Z]{4,24})$/
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
 * @api {post} /api/account-types Create account type
 * @apiVersion 0.1.0
 * @apiName CreateAccountType
 * @apiGroup AccountType
 *
 * @apiHeader Authorization Authorization token.
 * @apiHeaderExample Authorization Header
 * 'Authorization': 'Bearer <authorization token>'
 *
 * @apiParam {String} name Name of account type.
 *
 * @apiSuccess {Integer} id Id of new account type.
 * @apiSuccess {String} name Name of new account type.
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'id': 1
 *      'name': 'other'
 *    }
 *
 * @apiError TokenExpired Authorization token has expired.
 * @apiErrorExample TokenExpired Response
 *     HTTP/1.1 422 TokenExpired
 *     {
 *       'message': 'Jwt expired'
 *     }
 *
 * @apiError MissingName Request body does not have a name attribute.
 * @apiErrorExample MissingName Response
 *     HTTP/1.1 422 MissingName
 *     {
 *       'message': 'Missing account type name'
 *     }
 *
 * @apiError InvalidName Request body contains an invalid name attribute.
 * @apiErrorExample InvalidName Response
 *     HTTP/1.1 422 InvalidName
 *     {
 *       'message': 'Invalid account type name'
 *     }
 *
 * @apiError Unauthorized Api request does not have authorization to create an account type.
 * @apiErrorExample Unauthorized Response
 *     HTTP/1.1 422 Unauthorized
 *     {
 *       'message': 'Unauthorized'
 *     }
 *
 * @apiError Forbidden Account making api request is not an admin account.
 * @apiErrorExample Forbidden Response
 *     HTTP/1.1 422 Forbidden
 *     {
 *       'message': 'Forbidden'
 *     }
 */
const create = (req, res) => {
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
  // validate request parameters
  if (!req.body.name) {
    res.status(400).send({message: strings.missingAccountTypeNameErr})
  } else if (!accountTypeNameRegex.test(req.body.name)) {
    res.status(400).send({message: strings.invalidAccountTypeNameErr})
  }
  let query = {where: {name: req.body.name}}

  return AccountType.findOrCreate(query)
    .spread((accountType, created) => {
      return res.status(200).send(accountType)
    })
    .catch(err => {
      let errRes = { message: err.message }
      log.error(`AccountTypeController.create: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

/**
 * @api {put} /api/account-types/:id Update account type
 * @apiVersion 0.1.0
 * @apiName UpdateAccountType
 * @apiGroup AccountType
 *
 * @apiHeader Authorization Authorization token.
 * @apiHeaderExample Authorization Header
 * 'Authorization': 'Bearer <authorization token>'
 *
 * @apiParam {Integer} id Id of account type to update.
 * @apiParam {String} [name] New account type name.
 *
 * @apiSuccess {Integer} id Id of updated account type.
 * @apiSuccess {String} name Name of updated account type.
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'id': 1
 *      'name': 'other'
 *    }
 *
 * @apiError TokenExpired Authorization token has expired.
 * @apiErrorExample TokenExpired Response
 *     HTTP/1.1 401 TokenExpired
 *     {
 *       'message': 'Jwt expired'
 *     }
 *
 * @apiError Unauthorized Api request does not have authorization to update account type.
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
 *
 * @apiError InvalidName Request body contains an invalid name attribute.
 * @apiErrorExample InvalidName Response
 *     HTTP/1.1 422 InvalidName
 *     {
 *       'message': 'Invalid account type name'
 *     }
 *
 * @apiError NotFound Account type to update was not found.
 * @apiErrorExample NotFound Response
 *     HTTP/1.1 404 NotFound
 *     {
 *       'message': 'Account type was not found'
 *     }
 */
const update = (req, res) => {
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

    // prevent a user account from updating account type
  if (tokenContents.account.accountType.name !== 'Admin') {
    return res.status(403).send({message: strings.forbiddenErr})
  }

  let update = {}
  if (req.body.name) {
    if (!accountTypeNameRegex.test(req.body.name)) {
      res.status(400).send({message: strings.invalidAccountTypeNameErr})
    } else {
      update.name = req.body.name
    }
  }
  let options = { where: { $and: {
    id: parseInt(req.params.id),
    name: { $notIn: ['Admin', 'User'] }
  }}}

  return AccountType.update(update, options)
    .then(count => {
      if (count[0] === 0) {
        return res.status(404).send({ message: strings.accountTypeNotFoundErr })
      } else {
        update.id = parseInt(req.params.id)
        return res.status(200).send(update)
      }
    })
    .catch(err => {
      let errRes = { message: err.message }
      log.error(`AccountTypeController.update: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

/**
 * @api {delete} /api/account-types/:id Delete account type
 * @apiVersion 0.1.0
 * @apiName DeleteAccountType
 * @apiGroup AccountType
 *
 * @apiHeader Authorization Authorization token.
 * @apiHeaderExample Authorization Header
 * 'Authorization': 'Bearer <authorization token>'
 *
 * @apiParam {Integer} id Id of account type to delete.
 *
 * @apiSuccess {String} message Account type deleted successfully.
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'id': 1
 *      'name': 'other'
 *    }
 *
 * @apiError TokenExpired Authorization token has expired.
 * @apiErrorExample TokenExpired Response
 *     HTTP/1.1 401 TokenExpired
 *     {
 *       'message': 'Jwt expired'
 *     }
 *
 * @apiError Unauthorized Api request does not have authorization to delete account type.
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
 *
 * @apiError InvalidName Request body contains an invalid name attribute.
 * @apiErrorExample InvalidName Response
 *     HTTP/1.1 422 InvalidName
 *     {
 *       'message': 'Invalid account type name'
 *     }
 *
 * @apiError NotFound Account type to delete was not found.
 * @apiErrorExample NotFound Response
 *     HTTP/1.1 404 NotFound
 *     {
 *       'message': 'Account type was not found'
 *     }
 */
const remove = (req, res) => {
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

    // prevent a user account from updating account type
  if (tokenContents.account.accountType.name !== 'Admin') {
    return res.status(403).send({message: strings.forbiddenErr})
  }

  let options = { where: { $and: {
    id: parseInt(req.params.id),
    name: { $notIn: ['Admin', 'User'] }
  }}}

  return AccountType.destroy(options)
    .then(count => {
      if (count === 0) {
        return res.status(404).send({ message: strings.accountTypeNotFoundErr })
      } else {
        return res.status(200).send({ message: strings.deletedAccountTypeMsg })
      }
    })
    .catch(err => {
      let errRes = { message: err.message }
      log.error(`AccountTypeController.remove: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

/**
 * @api {get} /api/account-types Find account types
 * @apiVersion 0.1.0
 * @apiName FindAccountTypes
 * @apiGroup AccountType
 *
 * @apiParam {Integer} [id] Id of account type.
 * @apiParam {String} [name] Name of account type.
 * @apiParam {integer} [limit] Return a limited number of accounts (maximum of 25).
 * @apiParam {integer} [offset] Return results from the position specified by offset.
 *
 * @apiSuccess {Array} accountTypess Account types that where found by request.
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'accountTypes': [
 *        {
 *          'id': 1
 *          'name': 'admin'
 *        },
 *        <other account types>
 *      ]
 *    }
 */
const find = (req, res) => {
  let options = parseFindQuery(req.query)
    // TODO: parse req.query for fields that are in the model
  return AccountType.findAll(options)
    .then(accountTypes => {
      return res.status(200).send({accountTypes: accountTypes})
    })
    .catch(err => {
      let errRes = { message: err.message }
      log.error(`AccountTypeController.find: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

/**
 * Creates and returns a sequelize query to find account types.
 *
 * @param {Object} reqQuery GET parameters.
 *
 * @returns {Object} A Sequelize query parameters to find account types.
 */
const parseFindQuery = (reqQuery) => {
  let query = {where: {}}
  if (reqQuery.name) {
    query.where.name = reqQuery.name
  }
  if (reqQuery.limit) {
    let limit = parseInt(reqQuery.limit)
    if (Number.isInteger(limit)) {
      query.limit = Math.min(serverConfig.limitCap, limit)
    }
  }

  if (reqQuery.offset) {
    let offset = parseInt(reqQuery.offset)
    if (Number.isInteger(offset)) {
      query.offset = offset
    }
  }
  return query
}

/**
 * @api {get} /api/account-types/:id Find an account type
 * @apiVersion 0.1.0
 * @apiName FindAccountType
 * @apiGroup AccountType
 *
 * @apiParam {Integer} id Id of account type.
 *
 * @apiSuccess {Integer} id Id of updated account type.
 * @apiSuccess {String} name Name of updated account type.
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'id': 1
 *      'name': 'other'
 *    }
 *
 * @apiError NotFound Account type to was not found.
 * @apiErrorExample NotFound Response
 *     HTTP/1.1 404 NotFound
 *     {
 *       'message': 'Account type was not found'
 *     }
 */
const findOne = (req, res) => {
  let id = parseInt(req.params.id)

  return AccountType.findById(id)
    .then(accountType => {
      if (accountType) {
        return res.status(200).send(accountType)
      } else {
        return res.status(404).send({message: strings.accountTypeNotFoundErr})
      }
    })
    .catch(err => {
      let errRes = { message: err.message }
      log.error(`AccountTypeController.findOne: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

module.exports = {
  create: create,
  update: update,
  remove: remove,
  find: find,
  findOne: findOne
}
