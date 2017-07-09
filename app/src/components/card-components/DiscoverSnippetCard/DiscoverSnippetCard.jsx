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

import DisplaySnippetDialog from
'../../dialog-components/DisplaySnippetDialog/DisplaySnippetDialog.jsx'

/**
 * Material card component for displaying discovered snippets.
 * @author Tim Miller
 */
class DiscoverSnippetCard extends Component {
  componentDidMount () {
    $('.modal').modal()
  }

  /**
   * Opens a modal dialog when the display floating action button is clicked.
   */
  displayViewDialog () {
    $('#displaySnippetBody' + this.props.snippet.id).modal('open')
  }

  /**
   * Returns a date string derived from the date parameter.
   *
   * @param {String} date - Timestamp to format.
   *
   * @returns {String} The date parameter formatted as a date string.
   */
  formatDate (date) {
    return new Date(date).toDateString()
  }

  render () {
    return (
      <div className='card'>
        <div className='card-content cardHeader'>
          <span className='card-title white-text'>{this.props.snippet.name}</span>
        </div>

        <div className='card-content discoverCardBody'>
          <div className='row'>
            <div className='col s3'>
              <strong>Author</strong>
            </div>
            <div className='col s9'>
              <span className='light'>{this.props.snippet.author.username}</span>
            </div>
            <div className='col s3'>
              <strong>created</strong>
            </div>
            <div className='col s9'>
              <span className='light'>
                {this.formatDate(this.props.snippet.createdAt)}
              </span>
              <button
                title='view snippet'
                name='viewer'
                onClick={(e) => this.displayViewDialog()}
                className='btn-floating light-blue discoverCardViewBtn'>
                <i className='material-icons right-align'>pageview</i>
              </button>
            </div>
          </div>
        </div>

        <DisplaySnippetDialog
          modalId={'displaySnippetBody' + this.props.snippet.id}
          modalTitle={this.props.snippet.name}
          modalBody={this.props.snippet.body}
        />
      </div>
    )
  }
}

DiscoverSnippetCard.propTypes = {
  snippet: PropTypes.object.isRequired
}
export default DiscoverSnippetCard
