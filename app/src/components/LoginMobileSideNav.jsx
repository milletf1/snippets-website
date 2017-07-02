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

import LoginSideNavHeader from './side-nav-components/LoginSideNavHeader.jsx'
import SideNavSimpleLink from './side-nav-components/SideNavSimpleLink.jsx'

import Account from '../modules/Account'

/**
 * Side nav that displays when a user is logged in on a mobile device.
 * @author Tim Miller
 */
class LoginMobileSideNav extends Component {
  render () {
    return (
      <ul className='side-nav' id='mobile-nav'>
        <LoginSideNavHeader name={Account.getAccountName()} email={Account.getAccountEmail()} />
        <SideNavSimpleLink linkTo='/write' linkText='Write snippets' />
        <SideNavSimpleLink linkTo='/manage' linkText='Manage snippets' />
        <SideNavSimpleLink linkTo='/discover' linkText='Discover snippets' />
        <SideNavSimpleLink linkTo='/logout' linkText='Log out' />
      </ul>
    )
  }
}
export default LoginMobileSideNav
