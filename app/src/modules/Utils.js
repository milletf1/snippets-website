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
 *
 * @author Tim Miller
 */
'use strict'

class Utils {
    /**
     * Creates and returns an array that is used by {@link Pagination.jsx}
     * as a searchPages prop to create pagination tabs.
     *
     * @param {number} curPage - Page that is currently visible.
     * @param {number} numPages - Total number of Pages.
     * @param {number} [maxVisiblePages] - Size of array to return (defaults to 5).
     *
     * @throws {TypeError} A TypeError will be thrown if curPage is not an integer.
     * @throws {TypeError} A TypeError will be thrown if numPages is not an integer.
     * @throws {TypeError} A TypeError will be thrown if maxVisiblePages is not an integer.
     *
     * @returns {array} An array of integers that specify the page indexes that should be displayed
     *          by a pagination bar
     */
  static createPaginationArray (curPage, numPages, maxVisiblePages = 5) {
    if (!Number.isInteger(curPage)) {
      throw new TypeError('curPage must be an integer')
    } else if (!Number.isInteger(numPages)) {
      throw new TypeError('numPages must be an integer')
    } else if (!Number.isInteger(maxVisiblePages)) {
      throw new TypeError('maxVisiblePages must be an integer')
    }
    if (numPages <= 0) {
      return []
    } else if (numPages === 1) {
      return [1]
    }
    let paginationArr = [1]
    let numInnerElements = numPages > maxVisiblePages ? maxVisiblePages - 2 : numPages - 2

    if (numInnerElements === 1 && curPage > 1 && curPage < numPages) {
      // add current page to pagination array if there is only 1 inner element
      // and the current page is not the first or last page
      paginationArr.push(curPage)
    } else if (numPages < maxVisiblePages) {
      // add all integers between 1 and numPages if number
      // of pages is less than max visible pages
      for (let i = 0; i < numInnerElements; i++) {
        paginationArr.push(i + 2)
      }
    } else if (curPage < numInnerElements + 1) {
      // if the current page falls between 1 and 1 + number of elements,
      // add inner elements from 1 + 1 to 1 + numInnerElements
      for (let i = 0; i < numInnerElements; i++) {
        paginationArr.push(i + 2)
      }
    } else if (curPage > numPages - numInnerElements) {
      // if the current page falls between number of pages - inner elements and number
      // of pages, add inner elements from numPages to numPages - numInnerElements
      let startPos = numPages - numInnerElements
      for (let i = startPos; i < numPages; i++) {
        paginationArr.push(i)
      }
    } else {
      // add inner elements equal to curPage - (numInnerElements)
      let posIncrement = Math.max(curPage - Math.floor(numInnerElements / 2), 2)
      for (let i = 0; i < numInnerElements; i++) {
        paginationArr.push(i + posIncrement)
      }
    }
    paginationArr.push(numPages)
    return paginationArr
  }

  /**
   * Formats and returns a date string.
   *
   * @param {string} date - A string representing a date.  This string should be in a format recognized
   * by [Date.parse()]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse}
   *
   * @throws {TypeError} A TypeError will be thrown if date parameter is not a string.
   * @returns {string} A formatted date string.
   */
  static formatDate (date) {
    if (typeof date !== 'string') {
      throw new TypeError('date must be a string')
    }
    return new Date(date).toDateString().substring(4)
  }
}
export default Utils
