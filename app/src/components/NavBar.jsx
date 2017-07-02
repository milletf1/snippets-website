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
 *
 * @author Tim Miller
 */
'use strict'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import LoginMobileSideNav from './LoginMobileSideNav.jsx'
import LogoutMobileSideNav from './LogoutMobileSideNav.jsx'

import Auth from '../modules/Auth'

/**
 * Navigation bar component.
 * @author Tim Miller
 */
class NavBar extends Component {
  render () {
    return (
      <nav>
        <div className='nav-wrapper'>
          <Link to='/' className='brand-logo'>Snippets</Link>
          <a href='#' data-activates='mobile-nav' className='button-collapse'>
            <i className='material-icons'>menu</i>
          </a>

          {!Auth.isUserAuthenticated() && (
            <LogoutMobileSideNav />
          )}

          {Auth.isUserAuthenticated() ? (
            <LoginMobileSideNav />
          ) : (
            <ul className='side-nav' id='mobile-nav'>
              <li>
                <div className='navHeader'>
                  <Link to='/' className='brand-logo'>Snippets</Link>
                </div>
              </li>
              <li><Link to='/login'>Log in</Link></li>
              <li><Link to='/signup'>Sign up</Link></li>
            </ul>
          )}
        </div>
      </nav>
    )
  }
}
NavBar.propTypes = {
  router: PropTypes.object.isRequired
}
export default NavBar
