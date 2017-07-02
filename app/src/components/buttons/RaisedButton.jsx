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
 * Raised Materialize button component.
 * @author Tim Miller
 */
class RaisedButton extends Component {
  render () {
    return (
      <button
        id={this.props.buttonId}
        className='btn waves-effect waves-light col s12'
        title={this.props.buttonTitle}
        disabled={this.props.buttonDisabled}
        onClick={this.props.buttonClick}
        type={this.props.buttonType}
        name={this.props.buttonName}>
        {this.props.buttonLeftIcon && (
          <i className='material-icons left'>{this.props.buttonLeftIcon}</i>
        )}
        {this.props.buttonLabel}
        {this.props.buttonRightIcon && (
          <i className='material-icons right'>{this.props.buttonRightIcon}</i>
        )}
      </button>
    )
  }
}

RaisedButton.propTypes = {
  buttonId: PropTypes.string,
  buttonTitle: PropTypes.string,
  buttonClick: PropTypes.func,
  buttonDisabled: PropTypes.bool,
  buttonLabel: PropTypes.string,
  buttonType: PropTypes.string,
  buttonName: PropTypes.string,
  buttonLeftIcon: PropTypes.string,
  buttonRightIcon: PropTypes.string
}

export default RaisedButton
