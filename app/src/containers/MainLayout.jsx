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

import FooterNoSideNav from '../components/FooterNoSideNav.jsx'
import FooterSideNav from '../components/FooterSideNav.jsx'
import NavBar from '../components/NavBar.jsx'
import FixedSideNav from '../components/FixedSideNav.jsx'

import Auth from '../modules/Auth'

/**
 * Page container.
 * @author Tim Miller
 */
class MainLayout extends Component {
  render () {
    return (
      <div id='mainLayout'>
        {Auth.isUserAuthenticated() ? (
          <div className='fillHeight'>
            <NavBar />
            <div id='routeContainer'>
              <div className='row'>
                <div className='col l4 xl3'>
                  <FixedSideNav />
                </div>
                <div className='col s12 l8'>
                  { this.props.children }
                </div>
              </div>
            </div>
            <FooterSideNav />
          </div>
                ) : (
                  <div className='row fillHeight'>
                    <NavBar />
                    <div id='routeContainer'>
                      { this.props.children }
                    </div>
                    <FooterNoSideNav />
                  </div>
                )}
      </div>
    )
  }
}

export default MainLayout
