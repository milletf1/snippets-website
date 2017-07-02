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
 * Dialog component for displaying the body of a snippet.
 * @author Tim Miller
 */
class DisplaySnippetDialog extends Component {
  /**
   * Copys the snippet body to the clipboard.
   *
   * @param {Object} event - Button click event.
   */
  copySnippet (event) {
    event.preventDefault()
    let snippetText = document.querySelector(`#${this.props.modalId}Body`)
    let range = document.createRange()
    range.selectNode(snippetText)
    window.getSelection().addRange(range)

    try {
      document.execCommand('copy')
    } catch (err) {
      console.log(err)
    }
    window.getSelection().removeAllRanges()
  }

  render () {
    return (
      <div id={this.props.modalId} className='modal'>
        <div className='modal-content viewSnippetDialogBody'>
          <h4>{this.props.modalTitle}</h4>
          <code id={this.props.modalId + 'Body'}>{this.props.modalBody}</code>
        </div>
        <div className='modal-footer'>
          <button
            className='waves-effect btn-flat'
            onClick={(e) => this.copySnippet(e)}>
            Copy
          </button>
        </div>
      </div>
    )
  }
}

DisplaySnippetDialog.propTypes = {
  modalId: PropTypes.string.isRequired,
  modalTitle: PropTypes.string.isRequired,
  modalBody: PropTypes.string.isRequired

}

export default DisplaySnippetDialog
