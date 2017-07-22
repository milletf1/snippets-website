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

import Auth from '../../modules/Auth'
import Account from '../../modules/Account'
import EditorSettings from '../../modules/EditorSettings'
import EditorSession from '../../modules/EditorSession'
import EditorSettingsDialog from
'../../components/dialog-components/EditorSettingsDialog/EditorSettingsDialog.jsx'
import RaisedButton from
'../../components/button-components/RaisedButton/RaisedButton.jsx'

/**
 * Write/edit snippets page.
 * @author Tim Miller.
 */
class CreatePage extends Component {
  constructor (props) {
    super(props)

    this.state = {
      snippet: {
        name: '',
        body: ''
      },
      editorSettings: {
        wordWrap: EditorSettings.getWordWrapSetting(),
        showInvisibles: EditorSettings.getShowInvisiblesSetting(),
        softTabs: EditorSettings.getSoftTabsSetting(),
        tabSize: EditorSettings.getTabSizeSetting(),
        editorMode: EditorSettings.getEditorModeSetting()
      },
      saveDisabled: true
    }

    this.onBodyChange = this.onBodyChange.bind(this)
    this.onNameChange = this.onNameChange.bind(this)
    this.clearSnippet = this.clearSnippet.bind(this)
    this.saveSnippet = this.saveSnippet.bind(this)
    this.onSaveSnippetClick = this.onSaveSnippetClick.bind(this)

    this.updateTabSize = this.updateTabSize.bind(this)
    this.updateSoftTabs = this.updateSoftTabs.bind(this)
    this.updateWordWrap = this.updateWordWrap.bind(this)
    this.updateShowInvisibles = this.updateShowInvisibles.bind(this)
    this.updateEditorMode = this.updateEditorMode.bind(this)
  }

  onBodyChange (event) {
    let editor = this.getEditor()
    let snippet = this.state.snippet
    snippet.body = editor.session.getValue()
    let disableSave = snippet.body.trim().length < 1 || snippet.name.trim().length < 1

    this.setState({ snippet: snippet, saveDisabled: disableSave })
    this.updateSession()
  }

  onNameChange (event) {
    event.preventDefault()
    let snippet = this.state.snippet
    snippet.name = event.target.value
    let disableSave = snippet.body.trim().length < 1 || snippet.name.trim().length < 1

    this.setState({ snippet: snippet, saveDisabled: disableSave })
    this.updateSession()
  }

  updateSession () {
    let editor = this.getEditor()
    let cursorPos = editor.selection.getCursor()
    let editorSession = {
      title: this.state.snippet.name,
      content: editor.session.getValue(),
      cursorRow: cursorPos.row,
      cursorCol: cursorPos.column
    }
    EditorSession.saveEditorSession(editorSession)
  }

  updateTabSize (tabSize) {
    if (!Number.isInteger(tabSize)) {
      throw new TypeError('tabSize must be an integer')
    }
    tabSize = Math.max(1, tabSize)
    tabSize = Math.min(20, tabSize)
    this.updateEditorSettings('tabSize', tabSize)
    this.getEditor().getSession().setTabSize(tabSize)
    EditorSettings.setTabSizeSetting(tabSize)
  }

  updateSoftTabs (softTabs) {
    if (typeof softTabs !== 'boolean') {
      throw new TypeError('softTabs must be a boolean')
    }
    this.updateEditorSettings('softTabs', softTabs)
    this.getEditor().getSession().setUseSoftTabs(softTabs)
    EditorSettings.setSoftTabsSetting(softTabs)
  }

  updateWordWrap (wordWrap) {
    if (typeof wordWrap !== 'boolean') {
      throw new TypeError('wordWrap must be a boolean')
    }
    this.updateEditorSettings('wordWrap', wordWrap)
    this.getEditor().getSession().setUseWrapMode(wordWrap)
    EditorSettings.setWordWrapSetting(wordWrap)
  }

  updateShowInvisibles (showInvisibles) {
    if (typeof showInvisibles !== 'boolean') {
      throw new TypeError('showInvisibles must be a boolean')
    }
    this.updateEditorSettings('showInvisibles', showInvisibles)
    this.getEditor().setShowInvisibles(showInvisibles)
    EditorSettings.setShowInvisiblesSetting(showInvisibles)
  }

  updateEditorMode (editorMode) {
    if (typeof editorMode !== 'string') {
      throw new TypeError('editorMode must be a string')
    }
    this.updateEditorSettings('editorMode', editorMode)
    this.getEditor().getSession().setMode(editorMode)
    EditorSettings.setEditorModeSetting(editorMode)
  }

  updateEditorSettings (key, value) {
    if (typeof key !== 'string') {
      throw new TypeError('key must be a string')
    }
    let editorSettings = this.state.editorSettings
    editorSettings[key] = value
    this.setState({ editorSettings: editorSettings })
  }

  getEditor () {
    return ace.edit('codeEditor')
  }

  componentDidMount () {
    this.setupEditor()
    this.checkIfEditing()
    $('#showInvisiblesBtn').on('click', event => {
      event.preventDefault()

      let editorSettings = this.state.editorSettings
      editorSettings.showInvisibles = !editorSettings.showInvisibles
      console.log('saved editorSettings: ' + JSON.stringify(editorSettings))
      this.setState({ editorSettings: editorSettings })
    })
  }

  setupEditor () {
    let editor = this.getEditor()
    let session = EditorSession.restoreEditorSession()
    // settings
    $('#editor').css('fontSize', '14px')
    editor.getSession().setUseSoftTabs(this.state.editorSettings.softTabs)
    editor.getSession().setTabSize(this.state.editorSettings.tabSize)
    editor.getSession().setUseWrapMode(this.state.editorSettings.wordWrap)
    editor.setShowInvisibles(this.state.editorSettings.showInvisibles)
    editor.getSession().setMode(this.state.editorSettings.editorMode)
    editor.on('change', this.onBodyChange)
    // session
    editor.session.setValue(session.content)
    editor.selection.moveCursorToPosition({
      row: session.cursorRow,
      column: session.cursorCol
    })
    let snippet = this.state.snippet
    snippet.name = session.title
    snippet.body = session.content
    this.setState({snippet: snippet})
  }

  checkIfEditing () {
    let query = this.props.location.query
    if (query.snippetToEditId) {
      // get snippet to edit
      this.getSnippetToEdit(query.snippetToEditId)
    }
  }

  clearSnippet () {
    // TODO: this should be fired from a confirmation dialog maybe
    this.setState({
      snippet: {
        body: '',
        name: ''
      },
      saveDisabled: true
    })
    let editor = this.getEditor()
    editor.setValue('')
    $('#snippetNameInput').setText('')
  }

  onSettingsClick () {
    $('#editorSettingsDialog').modal('open')
  }

  onSaveSnippetClick () {
    if (this.state.snippet.id) {
      this.updateSnippet()
    } else {
      this.saveSnippet()
    }
  }

  getSnippetToEdit (id) {
    if (!id) {
      return
    }
    const authorId = Account.getAccountId()

    return $.ajax({
      url: '/api/snippets',
      type: 'get',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: {
        id: id,
        authorId: authorId
      },
      success: res => {
        if (!!res.snippets && res.snippets.length === 1) {
          this.setState({
            snippet: {
              body: res.snippets[0].body,
              name: res.snippets[0].name,
              id: res.snippets[0].id
            },
            saveDisabled: false
          })
          $('#snippetNameInput').change()
          let editor = ace.edit('editor')
          editor.setValue(res.snippets[0].body, 1)
        }
      },
      error: (xhr, status, err) => {
        console.log(xhr.responseJSON.message)
      }
    })
  }

  updateSnippet () {
    if (this.state.snippet.body.trim().length < 1 ||
        this.state.snippet.name.trim().length < 1 ||
        !this.state.snippet.id) {
      return
    }
    return Auth.getToken()
      .then(token => {
        return $.ajax({
          url: '/api/snippets/' + this.state.snippet.id,
          type: 'put',
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          processData: false,
          data: JSON.stringify({
            name: this.state.snippet.name,
            body: this.state.snippet.body
          }),
          headers: {
            'Authorization': 'Bearer ' + token
          },
          success: res => {
            Materialize.toast(`Updated ${this.state.snippet.name}!`, 2000)
          },
          error: (xhr, status, err) => {
            if (xhr.responseJSON.message === 'jwt expired') {
              this.logout()
            }
          }
        })
      })
      .fail(err => {
        if (err === 'jwt expired') {
          this.logout()
        }
      })
  }

  logout () {
    Account.removeAccount()
    Auth.deauthenticateUser()
    this.props.router.push('/login')
  }

  saveSnippet () {
    if (this.state.snippet.body.trim().length < 1 ||
        this.state.snippet.name.trim().length < 1) {
      return
    }
    return Auth.getToken()
      .then(token => {
        return $.ajax({
          url: '/api/snippets',
          type: 'post',
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          processData: false,
          data: JSON.stringify({
            name: this.state.snippet.name,
            body: this.state.snippet.body
          }),
          headers: {
            'Authorization': 'Bearer ' + token
          },
          success: res => {
            let snippet = this.state.snippet
            snippet.id = res.id
            this.setState({snippet})

            Materialize.toast(`Saved ${snippet.name}!`, 2000)
          },
          error: (xhr, status, err) => {
            if (xhr.responseJSON.message === 'jwt expired') {
              this.logout()
            }
          }
        })
      }).fail(err => {
        if (err.message === 'jwt expired') {
          this.logout()
        }
      })
  }

  render () {
    return (
      <div>
        <div className='row'><h3 className='appHeader'>Write snippet</h3></div>
        <div className='row'>
          <div className='input-field col s12'>
            <input
              id='snippetNameInput'
              type='text'
              data-length='16'
              onChange={this.onNameChange}
              value={this.state.snippet.name}
            />
            <label for='snippetNameInput'>Name</label>
          </div>
        </div>
        <div className='row'>
          <div className='col s12 l9 xl10'>
            <div className='col s12' id='codeEditor'>Loading...</div>
          </div>
          <div className='col s12 l3 xl2'>
            <div class='row'>
              <div className='col s12'>
                <RaisedButton
                  buttonId='writeSnippetSaveBtn'
                  buttonTitle='Save snippet'
                  buttonDisabled={this.state.saveDisabled}
                  buttonClick={this.onSaveSnippetClick}
                  buttonRightIcon='send'
                  buttonLabel='Save' />
              </div>
              <div className='col s12'>
                <button
                  id='writeSnippetNewBtn'
                  className='btn-flat waves-effect waves-light col s12'
                  title='New snippet'
                  onClick={this.clearSnippet}>
                    New
                </button>
              </div>
              <div className='col s12'>
                <button
                  id='editSettingsBtn'
                  className='btn-flat waves-effect waves-light col s12'
                  title='Save snippet'
                  onClick={this.onSettingsClick}>
                    Settings
                </button>
              </div>
            </div>
          </div>
        </div>
        <EditorSettingsDialog
          modalId='editorSettingsDialog'
          showInvisibles={this.state.editorSettings.showInvisibles}
          tabSize={this.state.editorSettings.tabSize}
          softTabs={this.state.editorSettings.softTabs}
          wordWrap={this.state.editorSettings.wordWrap}
          editorMode={this.state.editorSettings.editorMode}
          onTabSizeChange={this.updateTabSize}
          onSoftTabsChange={this.updateSoftTabs}
          onWordWrapChange={this.updateWordWrap}
          onShowInvisiblesChanged={this.updateShowInvisibles}
          onEditorModeChanged={this.updateEditorMode}
        />
      </div>
    )
  }
}
CreatePage.propTypes = {}

export default CreatePage
