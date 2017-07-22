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

import Utils from '../../modules/Utils.js'

import Pagination from
'../../components/navigation-components/Pagination/Pagination.jsx'
import DiscoverSnippetCard from
'../../components/card-components/DiscoverSnippetCard/DiscoverSnippetCard.jsx'

/**
 * Discover snippets page.
 * @author Tim Miller
 */
class DiscoverPage extends Component {
  constructor (props) {
    super(props)

    this.state = {
      searchFields: {
        name: '',
        author: ''
      },
      searchDisplay: {
        count: 0,
        curPage: 0,
        numPages: 0,
        pageSize: 10
      },
      searchPages: [],
      snippets: []
    }
    this.onPaginationClick = this.onPaginationClick.bind(this)
  }

  countSnippets () {
    let deferred = $.Deferred()
    let reqData = {}
    let name = this.state.searchFields.name.trim()
    let author = this.state.searchFields.author.trim()

    if (name) {
      reqData.name = name
    }

    if (author) {
      reqData.author = author
    }

    $.ajax({
      url: '/api/snippets/count',
      type: 'get',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: reqData,
      success: res => {
        deferred.resolve(res.count)
      },
      error: (xhr, status, err) => {
        throw new Error(err)
      }
    })
    return deferred
  }

  searchSnippets () {
    let deferred = $.Deferred()
    let offset = Math.max(this.state.searchDisplay.curPage - 1, 0)
    offset = Math.min(this.state.searchDisplay.curPage - 1, this.state.searchDisplay.numPages - 1)
    offset *= this.state.searchDisplay.pageSize
    let reqData = {
      include: 'author',
      limit: this.state.searchDisplay.pageSize,
      offset: offset
    }
    let name = this.state.searchFields.name.trim()
    let author = this.state.searchFields.author.trim()

    if (name) {
      reqData.name = name
    }

    if (author) {
      reqData.author = author
    }

    $.ajax({
      url: '/api/snippets',
      type: 'get',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: reqData,
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

  processForm (event) {
    event.preventDefault()

    this.countSnippets()
      .then(count => {
        let searchDisplay = this.state.searchDisplay
        searchDisplay.curPage = 1
        searchDisplay.count = count
        searchDisplay.numPages = Math.ceil(count / searchDisplay.pageSize)
        let searchPages = Utils.createPaginationArray(searchDisplay.curPage, searchDisplay.numPages)
        this.setState({ searchDisplay, searchPages })
        return this.searchSnippets()
      })
      .then(snippets => {
        this.setState({ snippets })
      })
      .fail(err => {
        throw new Error(err)
      })
  }

  onPaginationClick (pageNum) {
    if (pageNum < 1 || pageNum > this.state.searchDisplay.numPages) {
      return
    }
    let searchDisplay = this.state.searchDisplay
    searchDisplay.curPage = pageNum
    let searchPages = Utils.createPaginationArray(searchDisplay.curPage, searchDisplay.numPages)
    this.setState({ searchDisplay, searchPages })

    this.searchSnippets()
      .then(snippets => {
        this.setState({snippets})
      })
  }

  updateFormInput (event) {
    let searchFields = this.state.searchFields
    let field = event.target.name
    searchFields[field] = event.target.value
    this.setState({ searchFields })
  }

  render () {
    return (
      <div>
        <div className='row'><h3 className='appHeader'>Discover snippets</h3></div>
        <form action='/' onSubmit={e => this.processForm(e)}>
          <div className='row'>
            <div className='input-field col s12 l6'>
              <input
                id='authorInput'
                name='author'
                value={this.state.searchFields.author}
                onChange={e => this.updateFormInput(e)}
                type='text'
                className='validate'
              />
              <label for='authorInput'>Author</label>
            </div>
            <div className='input-field col s12 l6'>
              <input
                id='nameInput'
                name='name'
                value={this.state.searchFields.name}
                onChange={e => this.updateFormInput(e)}
                type='text'
                className='validate'
              />
              <label for='nameInput'>Name</label>
            </div>
          </div>
          <div className='row'>
            <div className='col s4 l3 offset-s8 offset-l9'>
              <button className='btn waves-effet waves-light col s12' type='submit' name='action'>
                   Search<i className='material-icons right'>search</i>
              </button>
            </div>
          </div>
        </form>
        <div className='row'>
          {this.state.snippets.map(snippet =>
            <div key={snippet.id} className='col s12 m6 xl4'>
              <DiscoverSnippetCard snippet={snippet} />
            </div>
          )}
        </div>
        <div className='row'>
          <div className='col s12'>
            <Pagination
              onPaginationClick={this.onPaginationClick}
              searchPages={this.state.searchPages}
              curPage={this.state.searchDisplay.curPage}
              numPages={this.state.searchDisplay.numPages}
            />
          </div>
        </div>
      </div>
    )
  }
}
DiscoverPage.propTypes = {}

export default DiscoverPage
