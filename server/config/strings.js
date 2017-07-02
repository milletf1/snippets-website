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
 * String constants used by express server.
 * @author Tim Miller
 */
module.exports = {
  /** Email address not found error message. */
  missingEmailErr: 'Email address not provided',
  /** Email address is invalid error message. */
  invalidEmailErr: 'Email address is invalid',
  /** Username not found error message. */
  missingUsernameErr: 'Username not provided',
  /** Username is invalid error message. */
  invalidUsernameErr: 'Username is invalid',
  /** Password not found error message. */
  missingPasswordErr: 'Password not provided',
  /** Password is invalid error message. */
  invalidPasswordErr: 'Password is invalid',
  /** Account id not found error message. */
  missingAccountErr: 'Account id not provided',
  /** Account already exists error message. */
  accountExistsErr: 'This account already exists',
  /** Not an admin error message. */
  notAdminErr: 'Only administrator accounts can perform this action',
  /** Account not found error message. */
  accountNotFoundErr: 'Account not found',
  /** Account type not found error message. */
  accountTypeNotFoundErr: 'Account type not found',
  /** Unauthorized error message. */
  unauthorizedErr: 'Unauthorized',
  /** Forbidden error message. */
  forbiddenErr: 'Forbidden',
  /** Failed to delete account error message. */
  failedAccountDeleteErr: 'Failed to delete account',
  /** Unkown error message. */
  unkownErr: 'An unkown error occurred',
  /** Deleted account message. */
  deletedAccountMsg: 'Deleted account',
  /** Deleted account type message. */
  deletedAccountTypeMsg: 'Deleted account type',
  /** Deleted snippet message. */
  deletedSnippetMsg: 'Deleted snippet',
  /** Missing username or password error message. */
  missingDetailsErr: 'Missing username or password',
  /** Snippet body not found error message. */
  snippetBodyMissingErr: 'Missing snippet body',
  /** Snippet body is invalid message */
  invalidSnippetBodyErr: 'Snippet body is invalid',
  /** Snippet name not found error message. */
  snippetNameMissingErr: 'Missing snippet name',
  /** Snippet name is invalid message. */
  invalidSnippetNameErr: 'Snippet name is invalid',
  /** Snippet not found error message. */
  snippetNotFoundErr: 'Snippet not found',
  /** Forbidden username error message. */
  forbiddenUsernameErr: 'Cannot create an account with this username',
  /** Missing account type name error message. */
  missingAccountTypeNameErr: 'Missing account type name',
  /** Invalid account type name error message. */
  invalidAccountTypeNameErr: 'Invalid account type name',
  /** Failed to authenticate user message. */
  failAuthErr: 'Could not authenticate user'
}
