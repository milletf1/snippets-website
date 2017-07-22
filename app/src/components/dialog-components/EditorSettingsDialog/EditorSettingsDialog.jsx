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

import EditorSettings from '../../../modules/EditorSettings'
/**
 * Allows users to change code editor settings.
 * @author Tim Miller
 */
class EditorSettingsDialog extends Component {
  constructor (props) {
    super(props)

    this.state = {
      editorModes: EditorSettings.getEditorModesList()
    }
  }

  componentDidMount () {
    this.setupLabelClickListeners()
    $('select').material_select()
    $('#modeSelector').on('change', (e) => {
      this.props.onEditorModeChanged(e.target.value)
    })
    Materialize.updateTextFields()
  }

  /**
   * Initializes label click listeners.
   */
  setupLabelClickListeners () {
    $('#softTabsLabel').on('click', event => {
      event.preventDefault()
      let newValue = !this.props.softTabs
      this.props.onSoftTabsChange(newValue)
    })

    $('#wordWrapLabel').on('click', event => {
      event.preventDefault()
      let newValue = !this.props.wordWrap
      this.props.onWordWrapChange(newValue)
    })

    $('#showInvisiblesLabel').on('click', event => {
      event.preventDefault()
      let newValue = !this.props.showInvisibles
      this.props.onShowInvisiblesChanged(newValue)
    })
  }

  render () {
    return (
      <div id={this.props.modalId} className='modal'>
        <div className='modal-content'>
          <h4>Editor Settings</h4>
          <div className='row'>
            <div className='input-field col s4'>
              <select id='modeSelector' value={this.props.editorMode}>
                {this.state.editorModes.map(mode =>
                  <option value={mode.value}>
                    {mode.label}
                  </option>
                )}
              </select>
              <label>Editor mode</label>
            </div>

            <div className='input-field col s4'>
              <input
                id='wordWrapInput'
                type='checkbox'
                checked={this.props.wordWrap}
                onChange={e => null}
              />
              <label id='wordWrapLabel' for='wordWrapInput'>Use word wrap.</label>
            </div>

            <div className='input-field col s4'>
              <input
                id='showInvisiblesInput'
                type='checkbox'
                checked={this.props.showInvisibles}
                onChange={e => null}
              />
              <label id='showInvisiblesLabel' for='showInvisiblesInput'>Show invisibles.</label>
            </div>
          </div>
          <div className='row'>
            <div className='input-field col s4'>
              <input
                id='tabSizeInput'
                type='number'
                value={this.props.tabSize}
                onChange={e => this.props.onTabSizeChange(parseInt(e.target.value))}
              />
              <label id='tabSizeLabel'>Tab size</label>
            </div>

            <div className='input-field col s4'>
              <input
                id='softTabsInput'
                type='checkbox'
                checked={this.props.softTabs}
                onChange={e => null}
              />
              <label id='softTabsLabel' for='softTabsInput'>Use soft tabs.</label>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

EditorSettingsDialog.propTypes = {
  modalId: PropTypes.string.isRequired,
  tabSize: PropTypes.number.isRequired,
  softTabs: PropTypes.bool.isRequired,
  wordWrap: PropTypes.bool.isRequired,
  showInvisibles: PropTypes.bool.isRequired,
  editorMode: PropTypes.string.isRequired,

  onTabSizeChange: PropTypes.func.isRequired,
  onSoftTabsChange: PropTypes.func.isRequired,
  onWordWrapChange: PropTypes.func.isRequired,
  onShowInvisiblesChanged: PropTypes.func.isRequired,
  onEditorModeChanged: PropTypes.func.isRequired
}

export default EditorSettingsDialog
