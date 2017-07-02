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

/**
 * Settings for code editor.
 * @author Tim Miller
 */
class EditorSettings {
  /**
   * Editor settings key.
   * @typedef {Object} EditorSettingsKeys
   * @property {string} wordWrap - Key used to access word wrap setting.
   * @property {string} showInvisibles - Key used to access show invisibles setting.
   * @property {string} softTabs - Key used to access soft tabs setting.
   * @property {string} tabSize - Key used to access tab size setting.
   * @property {string} editorMode - Code editor mode.
   */

  /**
   * Returns key values for accessing editor settings.
   *
   * @returns {EditorSettingsKeys} Key values for editor settings.
   */
  static getEditorSettingsKeys () {
    return {
      wordWrap: 'editorWordWrap',
      showInvisibles: 'editorShowInvisibles',
      softTabs: 'editorUseSoftTabs',
      tabSize: 'editorTabSize',
      editorMode: 'editorMode'
    }
  }

  /**
   * Gets word wrap editor setting.
   *
   * @returns {boolean} Use word wrap setting.
   */
  static getWordWrapSetting () {
    let wordWrap = localStorage.getItem(this.getEditorSettingsKeys().wordWrap)
    if (wordWrap === null) {
      wordWrap = false
      this.setWordWrapSetting(wordWrap)
    } else if (typeof wordWrap !== 'boolean') {
      wordWrap = wordWrap !== 'false'
    }
    return wordWrap
  }

  /**
   * Sets word wrap editor setting.
   *
   * @param {boolean} wordWrap - Use word wrap setting.
   *
   * @throws {TypeError} A TypeError will be thrown if the wordWrap parameter is not a boolean.
   */
  static setWordWrapSetting (wordWrap) {
    if (typeof wordWrap !== 'boolean') {
      throw new TypeError('Word wrap setting must be a boolean')
    }
    let storageKeys = this.getEditorSettingsKeys()
    localStorage.setItem(storageKeys.wordWrap, wordWrap)
  }

  /**
   * Gets show invisibles editor setting.
   *
   * @returns {boolean} Show invisibles setting.
   */
  static getShowInvisiblesSetting () {
    let showInvisibles = localStorage.getItem(this.getEditorSettingsKeys().showInvisibles)
    if (showInvisibles === null) {
      showInvisibles = false
      this.setShowInvisiblesSetting(showInvisibles)
    } else if (typeof showInvisibles !== 'boolean') {
      showInvisibles = showInvisibles !== 'false'
    }
    return showInvisibles
  }

  /**
   * Sets show invisibles editor setting.
   *
   * @param {boolean} showInvisibles - Show invisibles setting.
   *
   * @throws {TypeError} A TypeError will be thrown if the showInvisibles parameter is not a
   * boolean.
   */
  static setShowInvisiblesSetting (showInvisibles) {
    if (typeof showInvisibles !== 'boolean') {
      throw new TypeError('Show invisibles setting must be a boolean')
    }
    let storageKeys = this.getEditorSettingsKeys()
    localStorage.setItem(storageKeys.showInvisibles, showInvisibles)
  }

  /**
   * Gets use soft tabs editor setting.
   *
   * @returns {boolean} Use soft tabs setting.
   */
  static getSoftTabsSetting () {
    let storageKeys = this.getEditorSettingsKeys()
    let softTabs = localStorage.getItem(storageKeys.softTabs)
    if (softTabs === null) {
      softTabs = true
      this.setSoftTabsSetting(softTabs)
    } else if (typeof softTabs !== 'boolean') {
      softTabs = softTabs !== 'false'
    }
    return softTabs
  }

  /**
   * Sets use soft tabs editor setting.
   *
   * @param {boolean} softTabs - Use soft tabs setting.
   *
   * @throws {TypeError} A TypeError will be thrown if the softTabs parameter is not a
   * boolean.
   */
  static setSoftTabsSetting (softTabs) {
    if (typeof softTabs !== 'boolean') {
      throw new TypeError('Soft tabs setting must be a boolean')
    }
    let storageKeys = this.getEditorSettingsKeys()
    localStorage.setItem(storageKeys.softTabs, softTabs)
  }

  /**
   * Get tab size editor setting.
   *
   * @return {number} Number of spaces in a tab.
   */
  static getTabSizeSetting () {
    let storageKeys = this.getEditorSettingsKeys()
    let tabSize = localStorage.getItem(storageKeys.tabSize)
    if (tabSize === null) {
      tabSize = 4
      this.setTabSizeSetting(tabSize)
    } else if (typeof tabSize !== 'number') {
      tabSize = parseInt(tabSize)
    }
    return tabSize
  }

  /**
   * Sets tab size editor setting.
   *
   * @param {number} Number of spaces to use in a tab.  Must be at least 1.
   *
   * @throws {TypeError} A TypeError will be thrown if tabSize is not an integer.
   * @throws {RangeError} A RangeError will be thrown if tabSize is less than 1.
   */
  static setTabSizeSetting (tabSize) {
    if (!Number.isInteger(tabSize)) {
      throw new TypeError('tabSize must be an integer that is greater than 1')
    } else if (tabSize <= 1) {
      throw new RangeError('tabSize must be an integer that is greater than 1')
    }
    let storageKeys = this.getEditorSettingsKeys()
    localStorage.setItem(storageKeys.tabSize, tabSize)
  }

  /**
   * Get code editor mode.
   *
   * @returns {string} Editor mode (as used by editor to set mode).
   */
  static getEditorModeSetting () {
    let storageKeys = this.getEditorSettingsKeys()
    let editorMode = localStorage.getItem(storageKeys.editorMode)
    if (editorMode === null) {
      editorMode = 'ace/mode/plain_text'
      this.setEditorMode(editorMode)
    }
    return editorMode
  }

  /**
   * Sets editor mode.
   *
   * @param {editorMode} Editor mode to set (as used by editor to set mode).
   */
  static setEditorModeSetting (editorMode) {
    let storageKeys = this.getEditorSettingsKeys()
    localStorage.setItem(storageKeys.editorMode, editorMode)
  }

  /**
   * Editor mode/label key.
   * @typedef {Object} EditorMode
   * @property {string} label - Name of the editor mode.
   * @property {string} value - Value used by code editor to set mode.
   */

  /**
   * Returns a list of editor modes.
   *
   * @returns {EditorMode[]} and array of editor modes.
   */
  static getEditorModesList () {
    return [
      {
        label: 'AutoHotkey',
        value: 'ace/mode/autohotkey'
      },
      {
        label: 'C++',
        value: 'ace/mode/c_cpp'
      },
      {
        label: 'CoffeeScript',
        value: 'ace/mode/coffee'
      },
      {
        label: 'C#',
        value: 'ace/mode/csharp'
      },
      {
        label: 'CSS',
        value: 'ace/mode/css'
      },
      {
        label: 'Fortran',
        value: 'ace/mode/fortran'
      },
      {
        label: 'Go',
        value: 'ace/mode/golang'
      },
      {
        label: 'HTML',
        value: 'ace/mode/html'
      },
      {
        label: 'Java',
        value: 'ace/mode/java'
      },
      {
        label: 'JavaScript',
        value: 'ace/mode/javascript'
      },
      {
        label: 'JSON',
        value: 'ace/mode/json'
      },
      {
        label: 'JSX',
        value: 'ace/mode/jsx'
      },
      {
        label: 'LESS',
        value: 'ace/mode/less'
      },
      {
        label: 'Lua',
        value: 'ace/mode/lua'
      },
      {
        label: 'Markdown',
        value: 'ace/mode/markdown'
      },
      {
        label: 'MATLAB',
        value: 'ace/mode/matlab'
      },
      {
        label: 'Objective-C',
        value: 'ace/mode/objectivec'
      },
      {
        label: 'Pascal',
        value: 'ace/mode/pascal'
      },
      {
        label: 'Perl',
        value: 'ace/mode/perl'
      },
      {
        label: 'PHP',
        value: 'ace/mode/php'
      },
      {
        label: 'Plain Text',
        value: 'ace/mode/plain_text'
      },
      {
        label: 'Python',
        value: 'ace/mode/python'
      },
      {
        label: 'Ruby',
        value: 'ace/mode/ruby'
      },
      {
        label: 'Rust',
        value: 'ace/mode/rust'
      },
      {
        label: 'SASS',
        value: 'ace/mode/sass'
      },
      {
        label: 'Scala',
        value: 'ace/mode/scala'
      },
      {
        label: 'SCSS',
        value: 'ace/mode/scss'
      },
      {
        label: 'SQL',
        value: 'ace/mode/sql'
      },
      {
        label: 'Swift',
        value: 'ace/mode/swift'
      },
      {
        label: 'TypeScript',
        value: 'ace/mode/typescript'
      },
      {
        label: 'XML',
        value: 'ace/mode/xml'
      },
      {
        label: 'YAML',
        value: 'ace/mode/yaml'
      }
    ]
  }
}

export default EditorSettings
