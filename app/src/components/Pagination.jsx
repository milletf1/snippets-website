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
import PropTypes from 'prop-types'

/**
 * Pagination component.
 * @author Tim Miller
 */
class Pagination extends Component {
  render () {
    return (
      <ul className='pagination'>
        <li className={this.props.curPage <= 1
          ? 'disabled' : 'waves-effect'}>
          <a onClick={(e) => this.props.onPaginationClick(this.props.curPage - 1)}>
            <i className='material-icons'>chevron_left</i>
          </a>
        </li>
        {this.props.searchPages.map(pageNum =>
          <li key={pageNum} className={this.props.curPage === pageNum
            ? 'active' : 'waves-effect'}>
            <a onClick={(e) => this.props.onPaginationClick(pageNum)}>
              {pageNum}
            </a>
          </li>
        )}
        <li className={this.props.curPage === this.props.numPages
          ? 'disabled' : 'waves-effect'}>
          <a onClick={(e) => this.props.onPaginationClick(this.props.curPage + 1)}>
            <i className='material-icons'>chevron_right</i>
          </a>
        </li>
      </ul>
    )
  }
}

Pagination.propTypes = {
  onPaginationClick: PropTypes.func.isRequired,
  searchPages: PropTypes.array.isRequired,
  curPage: PropTypes.number.isRequired,
  numPages: PropTypes.number.isRequired
}

export default Pagination
