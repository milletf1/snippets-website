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
 * Snippet API controller.
 * @author Tim Miller
 */
const Log = require('log')

const Snippet = require('../models').Snippet
const Account = require('../models').Account
const serverConfig = require('../config')
const strings = require('../config/strings')
const TokenHandler = require('../modules/TokenHandler')
const Utils = require('../modules/Utils')

const snippetNameRegex = /^([a-zA-Z0-9_-]{4,24})$/
const maxSnippetBodyLen = 10000
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
 * @api {post} /api/snippets Create snippet
 * @apiVersion 0.1.0
 * @apiName CreateSnippet
 * @apiGroup Snippet
 *
 * @apiHeader Authorization Authoriztion token.
 * @apiHeaderExample Authorization Header
 * 'Authorization': 'Bearer <authorization token>'
 *
 * @apiParam {String} name Name of snippet.
 * @apiParam {String} body Snippet content.
 *
 * @apiSuccess {Integer} id Id of new snippet.
 * @apiSuccess {Integer} authorId Id of snippet creator.
 * @apiSuccess {String} name Name of new snippet.
 * @apiSuccess {String} body Content of new snippet.
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'id': 1,
 *      'authorId': 1
 *      'name': 'some snippet',
 *      'body': 'body of new snippet'
 *    }
 *
 * @apiError TokenExpired Authorization token has expired.
 * @apiErrorExample TokenExpired Response
 *     HTTP/1.1 401 TokenExpired
 *     {
 *       'message': 'Jwt expired'
 *     }
 *
 * @apiError Unauthorized Api request does not have authorization to create a snippet.
 * @apiErrorExample Unauthorized Response
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       'message': 'Unauthorized'
 *     }
 */
const create = (req, res) => {
    // get account id token
  let tokenContents = null
  try {
    tokenContents = getTokenContents(req.headers)
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send({ message: err.message })
    } else {
      return res.status(401).send({ message: strings.unauthorizedErr })
    }
  }
  let newSnippet = null
  try {
    newSnippet = parseCreateRequest(req.body)
    newSnippet.authorId = tokenContents.account.id
  } catch (err) {
    log.error(err.stack)
    return res.status(400).send({ message: err.message })
  }

  // create template
  return Snippet.create(newSnippet)
    .then(snippet => {
      return res.status(200).send(snippet)
    })
    .catch(err => {
      let errRes = { message: err.message }
      log.error(`SnippetController.create: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

/**
 * Parses and validates request body of POST request.
 *
 * @param {Object} reqBody POST request body.
 *
 * @throws {Error} An error will be thrown if reqBody doesn't contain a name attribute.
 * @throws {Error} An error will be thrown if reqBody doesn't contain a body attribute.
 * @throws {Error} An error will be thrown if name fails a regex test.
 * @throws {Error} An error will be thrown if body is longer than 10000 characters.
 *
 * @return {Object} A JSON object that contains values for creating a new snippet.
 */
const parseCreateRequest = (reqBody) => {
  if (!reqBody.name) {
    throw new Error(strings.snippetNameMissingErr)
  }
  if (!reqBody.body) {
    throw new Error(strings.snippetBodyMissingErr)
  }
  if (!snippetNameRegex.test(reqBody.name)) {
    throw new Error(strings.invalidSnippetNameErr)
  }
  if (reqBody.body.length > maxSnippetBodyLen) {
    throw new Error(strings.invalidSnippetBodyErr)
  }
  return {
    name: reqBody.name,
    body: reqBody.body
  }
}

/**
 * @api {put} /api/snippets/:id Update snippet
 * @apiVersion 0.1.0
 * @apiName UpdateSnippet
 * @apiGroup Snippet
 *
 * @apiHeader Authorization Authoriztion token. Must belong to the author of the snippet that will
 * be updated.
 * @apiHeaderExample Authorization Header
 * 'Authorization': 'Bearer <authorization token>'
 *
 * @apiParam {Integer} id Id of snippet to update.
 * @apiParam {String} [name] Name of updated snippet.
 * @apiParam {String} [body] Content of updated snippet.
 *
 * @apiSuccess {Integer} id  Id of new snippet.
 * @apiSuccess {Integer} authorId  Id of snippet creator.
 * @apiSuccess {String} name Name of new snippet.
 * @apiSuccess {String} body Content of new snippet.
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'id': 1,
 *      'authorId': 1
 *      'name': 'some snippet',
 *      'body': 'body of new snippet'
 *    }
 *
 * @apiError TokenExpired Authorization token has expired.
 * @apiErrorExample TokenExpired Response
 *     HTTP/1.1 401 TokenExpired
 *     {
 *       'message': 'Jwt expired'
 *     }
 *
 * @apiError Unauthorized Api request does not have authorization to update the snippet.
 * @apiErrorExample Unauthorized Response
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       'message': 'Unauthorized'
 *     }
 *
 * @apiError NotFound Snippet to update was not found.
 * @apiErrorExample NotFound Response
 *     HTTP/1.1 404 NotFound
 *     {
 *       'message': 'Snippet was not found'
 *     }
 */
const update = (req, res) => {
    // get account id from token
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
    // update
  let update = {}
  if (req.body.name) {
    if (!snippetNameRegex.test(req.body.name)) {
      return res.status(400).send({message: strings.invalidSnippetNameErr})
    } else {
      update.name = req.body.name
    }
  }
  if (req.body.body) {
    if (req.body.body.length > maxSnippetBodyLen) {
      return res.status(400).send({message: strings.invalidSnippetBodyErr})
    } else {
      update.body = req.body.body
    }
  }

  let where = {where: {$and: {id: req.params.id, authorId: tokenContents.account.id}}}
  return Snippet.update(update, where)
    .then(count => {
      if (count[0] === 0) {
        return res.status(404).send({message: strings.snippetNotFoundErr})
      } else {
        update.id = parseInt(req.params.id)
        return res.status(200).send(update)
      }
    })
    .catch(err => {
      let errRes = { message: err.message }
      log.error(`SnippetController.update: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

/**
 * @api {delete} /api/snippets/:id Delete snippet
 * @apiVersion 0.1.0
 * @apiName DeleteSnippet
 * @apiGroup Snippet
 *
 * @apiHeader Authorization Authoriztion token. Must belong to either the snippet author or an admin
 * account.
 * @apiHeaderExample Authorization Header
 * 'Authorization': 'Bearer <authorization token>'
 *
 * @apiParam {integer} id Id of snippet to delete.
 *
 * @apiSuccess {String} message Message to inform user that snippet has been deleted.
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'message': 'Snippet has been deleted'
 *    }
 *
 * @apiError TokenExpired Authorization token has expired.
 * @apiErrorExample TokenExpired Response
 *     HTTP/1.1 401 TokenExpired
 *     {
 *       'message': 'Jwt expired'
 *     }
 *
 * @apiError Unauthorized Api request does not have authorization to update the snippet.
 * @apiErrorExample Unauthorized Response
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       'message': 'Unauthorized'
 *     }
 *
 * @apiError NotFound Snippet to update was not found.
 * @apiErrorExample NotFound Response
 *     HTTP/1.1 404 NotFound
 *     {
 *       'message': 'Snippet was not found'
 *     }
 */
const remove = (req, res) => {
  // get account id from token
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
  let options = {}

  if (tokenContents.account.accountType.name === 'Admin') {
    options.where = { id: req.params.id }
  } else {
    options.where = { $and: { id: req.params.id, authorId: tokenContents.account.id } }
  }

  return Snippet.destroy(options)
    .then(count => {
      if (count === 0) {
        return res.status(404).send({message: strings.snippetNotFoundErr})
      } else {
        return res.status(200).send({message: strings.deletedSnippetMsg})
      }
    })
    .catch(err => {
      let errRes = { message: err.message }
      log.error(`SnippetController.remove: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

/**
 * @api {get} /api/snippets Find snippets
 * @apiVersion 0.1.0
 * @apiName FindSnippets
 * @apiGroup Snippet
 *
 * @apiParam {Integer} [id] Id of snippet.
 * @apiParam {String} [name] Name of snippet.
 * @apiParam {String} [author] Name of snippet's author.
 * @apiParam {Integer} [authorId] Id of snippet's author.
 * @apiParam {String} [include] Include data that belongs to an account.  Include can be 'author',
 * which refers to account that created snippet.
 * @apiParam {Integer} [limit] Return a limited number of snippets (maximum of 25).
 * @apiParam {Integer} [offset] Return results from the position specified by offset.
 *
 * @apiSuccess {Array} snippets Snippets that where found by request.
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'snippets': [
 *        {
 *          'id': 1
 *          'authorId': 1,
 *          'name': 'snippet-name',
 *          'body': 'snippet body'
 *        },
 *        <other snippets>
 *      ]
 *    }
 */
const find = (req, res) => {
  return createFindPromise(req.query)
    .then(options => {
      return Snippet.findAll(options)
    })
    .then(snippets => {
      return res.status(200).send({snippets: snippets})
    })
    .catch(err => {
      let errRes = { message: err.message }
      log.error(`SnippetController.find: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

/**
 * @api {get} /api/snippets/:id Count snippets
 * @apiVersion 0.1.0
 * @apiName CountSnippets
 * @apiGroup Snippet
 *
 * @apiParam {Integer} [id] Id of snippet.
 * @apiParam {String} [name] Name of snippet.
 * @apiParam {String} [author] Name of snippet's author.
 * @apiParam {Integer} [authorId] Id of snippet's author.
 * @apiParam {Integer} [limit] Return a limited count of snippets (maximum of 25).
 * @apiParam {Integer} [offset] Return results from the position specified by offset.
 *
 * @apiSuccess {Integer} count Number of snippets found.
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'count': 100
 *    }
 */
const count = (req, res) => {
  return createFindPromise(req.query)
    .then(options => {
      return Snippet.findAndCountAll(options)
    })
    .then(result => {
      return res.status(200).send({count: result.count})
    })
    .catch(err => {
      let errRes = { message: err.message }
      log.error(`SnippetController.count: ${err.message}`)
      if (err.errors) {
        errRes.errors = err.errors
        log.error(`errors:\n${err.errors}`)
      }
      return res.status(422).send(errRes)
    })
}

/**
 * Creates and returns a promise to find snippets.
 *
 * @param {Object} query GET parameters.
 *
 * @return {Object} A promise to get query parameters to find snippets.
 */
const createFindPromise = (query) => {
  let findPromise = new Promise((resolve, reject) => {
    let options = {
      limit: serverConfig.limitCap,
      offset: 0,
      order: [
        ['updatedAt', 'DESC'],
        ['createdAt', 'DESC']
      ]
    }
    if (!query) {
      resolve(options)
    }
    options.where = { $and: {} }
    options.include = []

    if (query.include) {
      if (query.include.toLowerCase() === 'author') {
        options.include.push({
          model: Account,
          as: 'author',
          attributes: ['id', 'accountTypeId', 'email', 'username']
        })
      }
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

    if (query.authorId) {
      options.where.$and.authorId = query.authorId
    }

    if (query.name) {
      options.where.$and.name = {$like: `%${query.name}%`}
    }

    if (query.author) {
      return Account.findAll({where: {username: {$like: `%${query.author}%`}},
        attributes: ['id']})
          .then(accountIds => {
            options.where.$and.authorId = {
              $in: accountIds.map(accountId => accountId.id)
            }
            resolve(options)
          })
    } else {
      resolve(options)
    }
  })
  return findPromise
}

/**
 * @api {get} /api/snippets/:username/:snippetname Find a user snippet
 * @apiVersion 0.1.0
 * @apiName FindUserSnippet
 * @apiGroup Snippet
 *
 * @apiParam {String} username Name of snippet author.
 * @apiParam {String} snippetname Name of snippet.
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    This is a snippet body.  This route returns only a snippet body.
 */
const findUserSnippet = (req, res) => {
  let username = req.params.username
  let snippet = req.params.snippet

  return Account.findAll({where: {username: username}})
    .then(accounts => {
      if (accounts.length !== 1) {
        throw new Error(strings.snippetNotFoundErr)
      }
      let accountId = accounts[0].id
      return Snippet.findAll({where: {$and: {authorId: accountId, name: snippet}}})
    })
    .then(snippets => {
      if (snippets.length !== 1) {
        throw new Error(strings.snippetNotFoundErr)
      }
      return res.status(200).type('text/plain').send(snippets[0].body)
    })
    .catch(err => {
      log.error(`SnippetController.findUserSnippet: ${err.message}`)
      if (err.message === strings.snippetNotFoundErr) {
        return res.status(404).send({message: err.message})
      } else {
        let errRes = { message: err.message }
        if (err.errors) {
          errRes.errors = err.errors
          log.error(`errors:\n${err.errors}`)
        }
        return res.status(422).send(errRes)
      }
    })
}

/**
 * @api {get} /api/snippets/:id Find a snippet
 * @apiVersion 0.1.0
 * @apiName FindSnippet
 * @apiGroup Snippet
 *
 * @apiParam {Integer} id Id of snippet.
 *
 * @apiSuccess {Integer} id Id of found snippet.
 * @apiSuccess {Integer} authorId Id of snippet's author.
 * @apiSuccess {String} name Name of found snippet.
 * @apiSuccess {String} body Body of found snippet.
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      'id': 1
 *      'authorId': 1,
 *      'name': 'snippet-name',
 *      'body': 'snippet body'
 *    }
 *
 * @apiError NotFound Snippet to was not found.
 * @apiErrorExample NotFound Response
 *     HTTP/1.1 404 NotFound
 *     {
 *       'message': 'Snippet was not found'
 *     }
 */
const findOne = (req, res) => {
  let id = req.params.id

  return Snippet.findById(id)
    .then(snippet => {
      if (snippet) {
        return res.status(200).send(snippet)
      } else {
        return res.status(404).send({message: strings.snippetNotFoundErr})
      }
    })
    .catch(err => {
      let errRes = { message: err.message }
      log.error(`SnippetController.findOne: ${err.message}`)
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
  count: count,
  findUserSnippet: findUserSnippet,
  findOne: findOne
}
