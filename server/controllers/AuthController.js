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
 * Authorization controller.
 * @author Tim Miller
 */
const bcrypt = require('bcrypt')
const Log = require('log')

const serverConfig = require('../config')
const strings = require('../config/strings')
const Account = require('../models').Account
const AccountType = require('../models').AccountType

const TokenHandler = require('../modules/TokenHandler')
const Utils = require('../modules/Utils')
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
 * @api {post} /api/auth Authenticate a user account.
 * @apiVersion 0.1.0
 * @apiName AuthAccount
 * @apiGroup Authentication
 *
 * @apiParam {String} email Account email.
 * @apiParam {String} password Account password.
 *
 * @apiSuccess {String} token Authentication token.
 * @apiSuccess {Object} account Account that was authenticated.
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'account': {
 *        'username': 'some guy',
 *        'email': 'someguy@someplace.com',
 *      },
 *      'token': '<an authorization token>'
 *    }
 *
 * @apiError MissingDetails Email or password was missing from POST request.
 * @apiErrorExample MissingDetails Response
 *     HTTP/1.1 400 MissingDetails
 *     {
 *       'message': 'Missing username or password'
 *     }
 *
 * @apiError FailAuth Failed to authenticate account.
 * @apiErrorExample FailAuth Response
 *     HTTP/1.1 401 FailAuth
 *     {
 *       'message': 'Could not authenticate user'
 *     }
 */
const authAccount = (req, res) => {
  if ((!req.body.email && !req.body.username) || !req.body.password) {
    res.status(400).send({message: strings.missingDetailsErr})
    return
  }
  let options = {
    include: [
      {
        model: AccountType,
        as: 'accountType'
      }
    ]
  }
  if (req.body.email) {
    options.where = {email: req.body.email}
  } else if (req.body.username) {
    options.where = {username: req.body.username}
  }

  let foundAccount = null

  return Account.findOne(options)
    .then(account => {
      foundAccount = {
        id: account.id,
        email: account.email,
        username: account.username,
        accountType: account.accountType
      }
      if (!account) {
        return false
      }
      if (account) {
        return bcrypt.compare(req.body.password, account.password)
      } else {
        return false
      }
    }).then(passwordMatch => {
      if (passwordMatch) {
        let token = TokenHandler.generateToken(foundAccount, serverConfig.signingToken)
        return res.status(200).send({account: foundAccount, token: token})
      } else {
        return res.status(401).send({message: strings.failAuthErr})
      }
    })
    .catch((err) => {
      let errRes = { message: err.message }
      log.error(`AuthController.authAccount: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

/**
 * @api {put} /api/auth Refresh an account token.
 * @apiVersion 0.1.0
 * @apiName RefreshToken
 * @apiGroup Authentication
 *
 * @apiHeader Authorization Authorization token.
 * @apiHeaderExample Authorization Header
 * 'Authorization': 'Bearer <authorization token>'
 *
 * @apiSuccess {String} token Authentication token.
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'token': '<an authorization token>'
 *    }
 *
 *
 * @apiError TokenExpired Authorization token has expired.
 * @apiErrorExample TokenExpired Response
 *     HTTP/1.1 401 TokenExpired
 *     {
 *       'message': 'Jwt expired'
 *     }
 *
 * @apiError Unauthorized Api request does not have authorization token.
 * @apiErrorExample Unauthorized Response
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       'message': 'Unauthorized'
 *     }
 */
const refreshToken = (req, res) => {
  try {
    let decodedToken = getTokenContents(req.headers)
    let newToken = TokenHandler.generateToken(decodedToken.account, serverConfig.signingToken)
    return res.status(200).send({token: newToken})
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send({message: err.message})
    } else {
      return res.status(401).send({message: strings.unauthorizedErr})
    }
  }
}

module.exports = {
  authAccount: authAccount,
  refreshToken: refreshToken
}
