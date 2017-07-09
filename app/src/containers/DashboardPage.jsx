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

import React, { Component } from 'react'
import { Link } from 'react-router'
import Account from '../modules/Account'

/**
 * Account dashboard page.
 * @author Tim Miller
 */
class DashboardPage extends Component {
  constructor (props) {
    super(props)
    let account = Account.getAccountName()
    this.state = {
      account: account
    }
  }

  render () {
    return (
      <div id="dashboardContainer" className="container">
        <h3 id='dashboardHomeHeader' className='header center-align'>Welcome, {this.state.account}!</h3>

        <div id="dashboardOptionsContainer" className='row'>
          <div className='col s12 m4 promoTableCell'>
            <i className='large center-align material-icons'>
              <Link to='/write'>create</Link>
            </i>
            <p className='promoCaption'>Write</p>
            <p className='light center'>Write new snippets</p>

          </div>
          <div className='col s12 m4 promoTableCell'>
            <i className='large center-align material-icons'>
              <Link to='/manage'>apps</Link>
            </i>
            <p className='promoCaption'>Manage</p>
            <p className='light center'>Manage your snippets</p>
          </div>
          <div className='col s12 m4 promoTableCell'>
            <i className='large center-align material-icons'>
              <Link to='/discover'>search</Link>
            </i>
            <p className='promoCaption'>Discover</p>
            <p className='light center'>Browse snippets created by other users</p>
          </div>
        </div>
      </div>
    )
  }
}
export default DashboardPage
