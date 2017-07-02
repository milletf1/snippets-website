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
 * Express server routes.
 * @author Tim Miller
 */
 const express = require('express')
 const path = require('path')

 const Controllers = require('../controllers')
 const AccountController = Controllers.AccountController
 const AccountTypeController = Controllers.AccountTypeController
 const AuthController = Controllers.AuthController
 const SnippetController = Controllers.SnippetController

 const staticPath = 'public'
 const apiRoute = '/api'
 const accountRoute = '/accounts'
 const userRoute = '/user'
 const adminRoute = '/admin'
 const accountTypeRoute = '/account-types'
 const authRoute = '/auth'
 const snippetRoute = '/snippets'

 const countRoute = '/count'

 const idParam = '/:id'
 const usernameParam = '/:username'
 const snippetParam = '/:snippet'

 module.exports = (app) => {
    /** account route */
   app.get(apiRoute + accountRoute, AccountController.find)                                           // find accounts
   app.get(apiRoute + accountRoute + idParam, AccountController.findOne)                              // find an account by id
    /* TODO post route without user or admin */
   app.post(apiRoute + accountRoute + adminRoute, AccountController.createAdmin)                      // create an admin account
   app.post(apiRoute + accountRoute + userRoute, AccountController.createUser)                        // create a user account
   app.delete(apiRoute + accountRoute + idParam, AccountController.remove)                            // remove an account
   app.put(apiRoute + accountRoute + idParam, AccountController.update)                               // update an account
    /** account type route  */
   app.get(apiRoute + accountTypeRoute, AccountTypeController.find)                                   // find account types
   app.get(apiRoute + accountTypeRoute + idParam, AccountTypeController.findOne)                      // find an account type by id
   app.post(apiRoute + accountTypeRoute, AccountTypeController.create)                                // create an account type
   app.delete(apiRoute + accountTypeRoute + idParam, AccountTypeController.remove)                    // remove an account type
   app.put(apiRoute + accountTypeRoute + idParam, AccountTypeController.update)                       // update an account type
    /** authentication route */
   app.post(apiRoute + authRoute, AuthController.authAccount)                                         // login
   app.put(apiRoute + authRoute, AuthController.refreshToken)                                         // update token
    /** Snippet route */
   app.post(apiRoute + snippetRoute, SnippetController.create)                                        // create a snippet
   app.get(apiRoute + snippetRoute, SnippetController.find)                                           // find templates
   app.get(apiRoute + snippetRoute + countRoute, SnippetController.count)                             // get count
   app.get(apiRoute + snippetRoute + usernameParam + snippetParam, SnippetController.findUserSnippet) // get a snippet by username and snippet name
   app.get(apiRoute + snippetRoute + idParam, SnippetController.findOne)                              // find a snippet
   app.delete(apiRoute + snippetRoute + idParam, SnippetController.remove)                            // delete a snippet
   app.put(apiRoute + snippetRoute + idParam, SnippetController.update)                               // update a snippet
    /** serve static files */
   app.use(express.static(staticPath))
    /** serve index.html */
   app.get('*', (req, res) => {
     // TODO: ensure path.join works here
     res.sendFile(path.resolve(path.join(__dirname, '/../public/index.html')))
   })
 }
