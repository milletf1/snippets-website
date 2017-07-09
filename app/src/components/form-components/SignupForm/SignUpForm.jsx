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

import RaisedButton from
'../../button-components/RaisedButton/RaisedButton.jsx'

/**
 * Signup form component.
 * @author Tim Miller
 */
class SignUpForm extends Component {
  render () {
    return (
      <div id='signupForm' className='col s12 l6 offset-l3'>
        <div className='card'>
          <div className='card-content cardHeader'>
            <span className='card-title white-text'>Create account</span>
          </div>
          <div className='card-content'>
            <form className='row' action='/' onSubmit={this.props.onSubmit}>
              <div className='input-field col s12'>
                <input
                  id='accountNameInput'
                  name='accountName'
                  value={this.props.user.accountName}
                  onChange={this.props.onChange}
                  type='text'
                  className='validate'
                  required
                />
                <label for='emailInput' data-error='Invalid email'>
                    Account name
                </label>
              </div>
              <div className='input-field col s12'>
                <input
                  id='emailInput'
                  name='email'
                  value={this.props.user.email}
                  onChange={this.props.onChange}
                  type='email'
                  className='validate'
                  required
                />
                <label for='emailInput' data-error='Invalid email'>
                  Email
                </label>
              </div>
              <div className='input-field col s12'>
                <input
                  id='passwordInput'
                  name='password'
                  value={this.props.user.password}
                  onChange={this.props.onChange}
                  type='password'
                  className='validate'
                  required
                />
                <label for='passwordInput' data-error='Invalid password'>
                  Password
                </label>
              </div>
              <div className='row'>
                <div className='col s12'>
                  {(this.props.errors.signupError &&
                    <p className='error-message red-text center-align'>{this.props.errors.signupError}</p>) ||
                    <p>&nbsp;</p>}
                </div>
              </div>
              <div className='row'>
                <div className='col s12 l4 offset-l8'>
                  <RaisedButton
                    buttonType='submit'
                    buttonName='action'
                    buttonLabel='Create'
                    buttonRightIcon='send' />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

SignUpForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
}

export default SignUpForm
