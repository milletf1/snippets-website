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

import React from 'react'
import ReactDom from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { browserHistory, Router, Route } from 'react-router'

import MainLayout from './containers/MainLayout/MainLayout.jsx'
import HomePage from './containers/HomePage/HomePage.jsx'
import DashboardPage from './containers/DashboardPage/DashboardPage.jsx'
import CreatePage from './containers/CreatePage/CreatePage.jsx'
import ManagePage from './containers/ManagePage/ManagePage.jsx'
import DiscoverPage from './containers/DiscoverPage/DiscoverPage.jsx'
import LoginPage from './containers/LoginPage/LoginPage.jsx'
import SignUpPage from './containers/SignUpPage/SignUpPage.jsx'
import NotFoundPage from './containers/NotFoundPage/NotFoundPage.jsx'

import Auth from './modules/Auth'
import Account from './modules/Account'

injectTapEventPlugin()

const redirectIfLoggedIn = (nextState, replace) => {
  if (Auth.isUserAuthenticated()) {
    replace('/')
  }
}

const redirectIfNotLoggedIn = (nextState, replace) => {
  if (!Auth.isUserAuthenticated()) {
    replace('/')
  }
}

ReactDom.render((
  <div id='main'>
    <Router history={browserHistory}>
      <Route component={MainLayout}>
        <Route path='/'
          getComponent={(nextState, callback) => {
            if (Auth.isUserAuthenticated()) {
              callback(null, DashboardPage)
            } else {
              callback(null, HomePage)
            }
          }}
                />
        <Route path='/login'
          onEnter={redirectIfLoggedIn}
          getComponent={(nextState, callback) => {
            if (Auth.isUserAuthenticated()) {
              callback(null, DashboardPage)
            } else {
              callback(null, LoginPage)
            }
          }}
                />
        <Route path='/signup'
          onEnter={redirectIfLoggedIn}
          getComponent={(nextState, callback) => {
            if (Auth.isUserAuthenticated()) {
              callback(null, DashboardPage)
            } else {
              callback(null, SignUpPage)
            }
          }}
                />
        <Route path='/write'
          onEnter={redirectIfNotLoggedIn}
          getComponent={(nextState, callback) => {
            if (Auth.isUserAuthenticated()) {
              callback(null, CreatePage)
            } else {
              callback(null, HomePage)
            }
          }}
                />
        <Route path='/manage'
          onEnter={redirectIfNotLoggedIn}
          getComponent={(nextState, callback) => {
            if (Auth.isUserAuthenticated()) {
              callback(null, ManagePage)
            } else {
              callback(null, HomePage)
            }
          }}
                />
        <Route path='/discover'
          onEnter={redirectIfNotLoggedIn}
          getComponent={(nextState, callback) => {
            if (Auth.isUserAuthenticated()) {
              callback(null, DiscoverPage)
            } else {
              callback(null, HomePage)
            }
          }}
                />
        <Route path='/logout'
          onEnter={(nextState, replace) => {
            console.log('deauthing account')
            Auth.deauthenticateUser()
            console.log('removing account')
            Account.removeAccount()
            console.log('redirecting')
            replace('/')
          }}
                />
        <Route path='*' component={NotFoundPage} />
      </Route>
    </Router>
  </div>
), document.getElementById('app'))
