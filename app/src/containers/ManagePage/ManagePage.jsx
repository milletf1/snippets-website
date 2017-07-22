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

import Utils from '../../modules/Utils'
import Account from '../../modules/Account'
import Auth from '../../modules/Auth'

import Pagination from
'../../components/navigation-components/Pagination/Pagination.jsx'
import DisplaySnippetDialog from
'../../components/dialog-components/DisplaySnippetDialog/DisplaySnippetDialog.jsx'

/**
 * Manage snippets page.
 * @author Tim Miller
 */
class ManagePage extends Component {
  constructor (props) {
    super(props)

    this.state = {
      searchDisplay: {
        count: 0,
        curPage: 0,
        numPages: 0,
        pageSize: 10
      },
      searchPages: [],
      snippets: [],
      actionSnippet: {}
    }
    this.onPaginationClick = this.onPaginationClick.bind(this)
  }

  displaySnippets () {
    this.countUserSnippets()
      .then(count => {
        let searchDisplay = this.state.searchDisplay
        searchDisplay.curPage = 1
        searchDisplay.count = count
        searchDisplay.numPages = Math.ceil(count / searchDisplay.pageSize)
        let searchPages = Utils.createPaginationArray(searchDisplay.curPage, searchDisplay.numPages)
        this.setState({ searchDisplay, searchPages })
        return this.requestUserSnippets()
      })
      .then(snippets => {
        this.setState({ snippets })
      })
      .fail(err => {
        throw new Error(err)
      })
  }

  componentDidMount () {
    $('.modal').modal()
    this.displaySnippets()
  }

  removeActionSnippet () {
    let actionSnippet = {}
    this.setState({ actionSnippet })
  }

  countUserSnippets () {
    let deferred = $.Deferred()
    let authorId = Account.getAccountId()

    $.ajax({
      url: '/api/snippets/count',
      type: 'get',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: {
        authorId: authorId
      },
      success: res => {
        let count = res.count
        deferred.resolve(count)
      },
      error: (xhr, status, err) => {
        throw new Error(err)
      }
    })
    return deferred
  }

  requestUserSnippets () {
    let deferred = $.Deferred()
    let authorId = Account.getAccountId()
    let offset = Math.max(this.state.searchDisplay.curPage - 1, 0)
    offset = Math.min(this.state.searchDisplay.curPage - 1, this.state.searchDisplay.numPages - 1)
    offset *= this.state.searchDisplay.pageSize

    $.ajax({
      url: '/api/snippets',
      type: 'get',
      dataType: 'json',
      data: {
        authorId: authorId,
        limit: this.state.searchDisplay.pageSize,
        offset: offset
      },
      success: res => {
        let snippets = res.snippets
        deferred.resolve(snippets)
      },
      error: (xhr, status, err) => {
        throw new Error(err)
      }
    })
    return deferred
  }

    /**
     * Performs a request to delete a snippet.
     *
     * @param {number} snippetId - id of snippet to delete.
     * @returns {object} an Ajax request to delete a snippet with an id equal to the snippetId parameter
     */
  requestDeleteSnippet (snippetId) {
    return Auth.getToken()
    .then(token => {
      return $.ajax({
        url: '/api/snippets/' + snippetId,
        type: 'delete',
        dataType: 'json',
        headers: { Authorization: 'Bearer ' + token },
        error: (xhr, status, err) => {
          if (xhr.responseJSON.message === 'jwt expired') {
            this.logout()
          }
        }
      })
      .fail(err => {
        if (err.message === 'jwt expired') {
          this.logout()
        }
      })
    })
  }

  logout () {
    Account.removeAccount()
    Auth.deauthenticateUser()
    this.props.router.push('/login')
  }

    /**
     * Displays a modal dialog to confirm deletion of a snippet.
     *
     * @param {object} snippet - The snippet that will be deleted after confirmation.
     */
  displayDeleteDialog (snippet) {
    this.setState({actionSnippet: snippet})
    $('#confirmDeleteDialog').modal('open')
  }

    /**
     * Displays a snippet in a modal dialog.
     *
     * @param {object} snippet - The snippet to display
     */
  displayViewDialog (snippet) {
    this.setState({actionSnippet: snippet})
    $('#displaySnippetDialog').modal('open')
  }

  onPaginationClick (pageNum) {
    if (pageNum < 1 || pageNum > this.state.searchDisplay.numPages) {
      return
    }
    let searchDisplay = this.state.searchDisplay
    searchDisplay.curPage = pageNum
    let searchPages = Utils.createPaginationArray(searchDisplay.curPage, searchDisplay.numPages)
    this.setState({ searchDisplay, searchPages })

    this.requestUserSnippets()
      .then(snippets => {
        this.setState({snippets})
      })
  }

  confirmDeleteSnippet () {
    this.requestDeleteSnippet(this.state.actionSnippet.id)
      .done(() => {
        this.removeActionSnippet()
        this.displaySnippets()
      })
  }

  render () {
    return (
      <div>
        <div className='row'><h3 className='appHeader'>Manage snippets</h3></div>
        <div className='row'>
          <table className='bordered'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.state.snippets.map(snippet =>
                <tr key={snippet.id}>
                  <td>{snippet.name}</td>
                  <td>{Utils.formatDate(snippet.createdAt)}</td>
                  <td>{Utils.formatDate(snippet.updatedAt)}</td>
                  <td>
                    <button
                      title='view snippet'
                      className='btn-floating light-blue manageActionBtn'
                      onClick={() => this.displayViewDialog(snippet)}>
                      <i className='material-icons'>pageview</i>
                    </button>
                    <Link to={'/write?snippetToEditId=' + snippet.id}>
                      <button
                        title='edit snippet'
                        className='btn-floating grey manageActionBtn'>
                        <i className='material-icons'>edit</i>
                      </button>
                    </Link>
                    <button
                      title='delete snippet'
                      className='btn-floating red manageActionBtn'
                      onClick={() => this.displayDeleteDialog(snippet)}>
                      <i className='material-icons'>delete</i>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className='row'>
          <Pagination
            onPaginationClick={this.onPaginationClick}
            searchPages={this.state.searchPages}
            curPage={this.state.searchDisplay.curPage}
            numPages={this.state.searchDisplay.numPages}
          />
        </div>

        <div id='confirmDeleteDialog' className='modal'>
          <div className='modal-content'>
            <h4>Delete Snippet</h4>
            <p>Are you sure you wish to delete {this.state.actionSnippet.name}?</p>
          </div>
          <div className='modal-footer'>
            <button
              className='modal-action modal-close waves-effect waves-light-blue btn-flat'
              onClick={() => this.confirmDeleteSnippet()}>
                Delete
            </button>
            <button
              className='modal-action modal-close waves-effect waves-light-blue btn-flat'
              onClick={() => this.removeActionSnippet()}>
              Cancel
            </button>
          </div>
        </div>

        <DisplaySnippetDialog
          modalId='displaySnippetDialog'
          modalTitle={this.state.actionSnippet.name}
          modalBody={this.state.actionSnippet.body}
        />
      </div>
    )
  }
}

export default ManagePage
