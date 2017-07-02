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

const log = new Log()
const name = 'simple-html'
const body =
`<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>ADD TITLE</title>
    </head>
    <body>
        <div>hello world!</div>
    </body>
</html>`

const timestamp = new Date()

const getDemoUserQuery = 'select * from "Accounts" where "username"=\'DemoUser\''
module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.query(getDemoUserQuery)
      .then((res) => {
        let template = {
          name: name,
          body: body,
          authorId: res[0][0].id,
          createdAt: timestamp,
          updatedAt: timestamp
        }
        return queryInterface.bulkInsert('Snippets', [template], {})
      })
      .catch((err) => {
        log.warning(`failed to insert snippets with error:\n${err.message}`)
      })
  },
  down: (queryInterface) => {
    return queryInterface.sequelize.query(getDemoUserQuery)
      .then((res) => {
        return queryInterface.bulkDelete('Snippets', { authorId: res[0][0].id })
      })
      .catch((err) => {
        log.warning(`failed to delete snippets with error:\n${err.message}`)
      })
  }
}
