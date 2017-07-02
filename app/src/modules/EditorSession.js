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
 * Session storage for code editor.
 * @author Tim Miller
 */
class EditorSession {
  /**
   * Editor state session keys.
   * @typedef {Object} EditorStateSessionKeys
   * @property {string} title - Editor title key.
   * @property {string} content - Editor content key.
   * @property {string} cursorRow - Editor cursor row key.
   * @property {string} cursorCol - Editor cursor column key.
   */

  /**
   * State of editor.
   * @typedef {Object} EditorState
   * @property {string} title - Title of editor content.
   * @property {string} content - Content of editor.
   * @property {number} cursorRow - Cursor row in editor.
   * @property {number} cursorCol - Cursor column in editor.
   */

  /**
   * Returns key values for accessing editor state in session storage.
   *
   * @returns {EditorStateSessionKeys} Key values for editor state in session storage.
   */
  static getEditorStateKeys () {
    return {
      title: 'editorTitle',
      content: 'editorContent',
      cursorRow: 'editorCursorRow',
      cursorCol: 'editorCursorCol'
    }
  }

  /**
   * Saves editor text in session storage.
   *
   * @param {EditorState} editorState - State of editor.
   *
   * @throws {TypeError} A TypeError will be thrown if editorState is not an object.
   * @throws {TypeError} A TypeError will be thrown if editorState.cursorRow is not a number.
   * @throws {TypeError} A TypeError will be thrown if editorState.cursorCol is not a number.
   * @throws {RangeError} A RangeError will be thrown if editorState.cursorRow is less than 0.
   * @throws {RangeError} A RangeError will be thrown if editorState.cursorCol is less than 0.
   */
  static saveEditorSession (editorState) {
    if (typeof editorState !== 'object' || editorState === null) {
      throw new TypeError('editorState must be an object')
    } else if (typeof editorState.cursorRow !== 'number') {
      throw new TypeError('editorState.cursorRow must be a positive integer')
    } else if (editorState.cursorRow < 0) {
      throw new RangeError('editorState.cursorRow must be a positive integer')
    } else if (typeof editorState.cursorCol !== 'number') {
      throw new TypeError('editorState.cursorCol must be a positive integer')
    } else if (editorState.cursorCol < 0) {
      throw new RangeError('editorState.cursorCol must be a positive integer')
    }
    let storageKeys = this.getEditorStateKeys()
    sessionStorage.setItem(storageKeys.title, editorState.title)
    sessionStorage.setItem(storageKeys.content, editorState.content)
    sessionStorage.setItem(storageKeys.cursorRow, editorState.cursorRow)
    sessionStorage.setItem(storageKeys.cursorCol, editorState.cursorCol)
  }

  /**
   * Returns editor state that has been saved in session storage.
   *
   * @returns {EditorState} Saved state of editor for current session.
   */
  static restoreEditorSession () {
    let editorState = {}
    let storageKeys = this.getEditorStateKeys()
    editorState.title = sessionStorage.getItem(storageKeys.title) || ''
    editorState.content = sessionStorage.getItem(storageKeys.content) || ''
    editorState.cursorRow = parseInt(sessionStorage.getItem(storageKeys.cursorRow)) || 0
    editorState.cursorCol = parseInt(sessionStorage.getItem(storageKeys.cursorCol)) || 0
    return editorState
  }
}

export default EditorSession
