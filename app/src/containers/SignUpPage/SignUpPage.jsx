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
import Auth from '../../modules/Auth'
import Account from '../../modules/Account'
import SignUpForm from '../../components/form-components/SignUpForm/SignUpForm.jsx'

/**
 * Signup account page.
 * @author Tim Miller
 */
class SignUpPage extends Component {
  constructor (props) {
    super(props)

    this.state = {
      errors: {},
      user: {
        email: '',
        accountName: '',
        password: ''
      }
    }

    this.processForm = this.processForm.bind(this)
    this.changeUser = this.changeUser.bind(this)
  }

    /**
     * Change the user object.
     *
     * @param {object} event - the JavaScript event object
     */
  changeUser (event) {
    const field = event.target.name
    const user = this.state.user
    user[field] = event.target.value

    this.setState({user})
  }

    /**
     * Process the form
     *
     * @param {object} event - the JavaScript event object
     */
  processForm (event) {
    event.preventDefault()
    this.setState({errors: {}})
        // TODO: check everything is filled out, check passwords match, validate passwords and username
    if (!this.state.user.accountName || !this.state.user.email || !this.state.user.password) {
      return
    }
    const username = this.state.user.accountName
    const email = this.state.user.email
    const password = this.state.user.password

    $.ajax({
      url: '/api/accounts/user',
      type: 'post',
      data: {
        username: username,
        email: email,
        password: password
      },
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      dataType: 'json',
      success: (res) => {
        Auth.setToken(res.token)
        Account.saveAccount(res.account)
        this.props.router.push('/')
      },
      error: (xhr, status, err) => {
        const errors = {
          signupError: xhr.responseJSON.message
        }
        this.setState({ errors })
      }
    })
  }

  render () {
    return (
      <div>
        <SignUpForm
          onSubmit={this.processForm}
          onChange={this.changeUser}
          errors={this.state.errors}
          user={this.state.user}
        />
      </div>
    )
  }
}

SignUpPage.propTypes = {
  router: PropTypes.object.isRequired
}

export default SignUpPage
