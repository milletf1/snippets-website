define({ "api": [
  {
    "type": "post",
    "url": "/api/accounts/admin",
    "title": "Create admin account",
    "version": "0.1.0",
    "name": "CreateAdminAccount",
    "group": "Account",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Authorization token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Authorization Header",
          "content": "'Authorization': 'Bearer <authorization token>'",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Account username.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email of account.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "account",
            "description": "<p>Newly created account.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authorization token for new account.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'account': {\n    'id': 1\n    'username': 'some guy',\n    'email': 'someguy@someplace.com',\n    'accountTypeId': 1\n  },\n  'token': '<an authorization token>'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "ForbiddenUsername",
            "description": "<p>A forbidden username was found in the post request body.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "AccountExists",
            "description": "<p>An account exists that shares either an email address or username with the values in the post request body.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "TokenExpired",
            "description": "<p>Authorization token has expired.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Api request does not have authorization to create an admin account.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Forbidden",
            "description": "<p>Account making api request is not an admin account.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "ForbiddenUsername Response",
          "content": "HTTP/1.1 422 ForbiddenUsername\n{\n  'message': 'Cannot create an account with this username'\n}",
          "type": "json"
        },
        {
          "title": "AccountExists Response",
          "content": "HTTP/1.1 422 AccountExists\n{\n  'message': 'This account already exists'\n}",
          "type": "json"
        },
        {
          "title": "TokenExpired Response",
          "content": "HTTP/1.1 401 TokenExpired\n{\n  'message': 'Jwt expired'\n}",
          "type": "json"
        },
        {
          "title": "Unauthorized Response",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  'message': 'Unauthorized'\n}",
          "type": "json"
        },
        {
          "title": "Forbidden Response",
          "content": "HTTP/1.1 403 Forbidden\n{\n  'message': 'Forbidden'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/AccountController.js",
    "groupTitle": "Account"
  },
  {
    "type": "post",
    "url": "/api/accounts/user",
    "title": "Create user account",
    "version": "0.1.0",
    "name": "CreateUserAccount",
    "group": "Account",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Account username.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email of account.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "account",
            "description": "<p>Newly created account.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authorization token for new account.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'account': {\n    'username': 'some guy',\n    'email': 'someguy@someplace.com',\n  },\n  'token': '<an authorization token>'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "ForbiddenUsername",
            "description": "<p>A forbidden username was found in the post request body.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "AccountExists",
            "description": "<p>An account exists that shares either an email address or username with the values in the post request body.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "ForbiddenUsername Response",
          "content": "HTTP/1.1 422 ForbiddenUsername\n{\n  'message': 'Cannot create an account with this username'\n}",
          "type": "json"
        },
        {
          "title": "AccountExists Response",
          "content": "HTTP/1.1 422 AccountExists\n{\n  'message': 'This account already exists'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/AccountController.js",
    "groupTitle": "Account"
  },
  {
    "type": "delete",
    "url": "/api/accounts/:id",
    "title": "Delete an account",
    "version": "0.1.0",
    "name": "DeleteAccount",
    "group": "Account",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Authorization token. Must belong to either the account that will be deleted, or an admin account.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Authorization Header",
          "content": "'Authorization': 'Bearer <authorization token>'",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of account to delete.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message to inform user that account has been deleted.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'message': 'Account has been deleted'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "TokenExpired",
            "description": "<p>Authorization token has expired.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Api request does not have authorization to delete the account.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Forbidden",
            "description": "<p>Account making api request is not an admin account or the account that will be deleted.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotFound",
            "description": "<p>Account to delete was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "TokenExpired Response",
          "content": "HTTP/1.1 401 TokenExpired\n{\n  'message': 'Jwt expired'\n}",
          "type": "json"
        },
        {
          "title": "Unauthorized Response",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  'message': 'Unauthorized'\n}",
          "type": "json"
        },
        {
          "title": "Forbidden Response",
          "content": "HTTP/1.1 403 Forbidden\n{\n  'message': 'Forbidden'\n}",
          "type": "json"
        },
        {
          "title": "NotFound Response",
          "content": "HTTP/1.1 404 NotFound\n{\n  'message': 'Account was not found'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/AccountController.js",
    "groupTitle": "Account"
  },
  {
    "type": "get",
    "url": "/api/accounts/:id",
    "title": "Find an account",
    "version": "0.1.0",
    "name": "FindAccount",
    "group": "Account",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of account.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of found account.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Username of found account.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email address of found account.</p>"
          },
          {
            "group": "Success 200",
            "type": "integer",
            "optional": false,
            "field": "accountTypeId",
            "description": "<p>Id of found account's account type.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'id': 1\n  'username': 'some guy',\n  'email': 'someguy@someplace.com',\n  'accountTypeId': 1\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotFound",
            "description": "<p>Account was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "NotFound Response",
          "content": "HTTP/1.1 404 NotFound\n{\n  'message': 'Account was not found'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/AccountController.js",
    "groupTitle": "Account"
  },
  {
    "type": "get",
    "url": "/api/accounts",
    "title": "Find accounts",
    "version": "0.1.0",
    "name": "FindAccounts",
    "group": "Account",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "id",
            "description": "<p>Id of account.</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "accountTypeId",
            "description": "<p>Find accounts that are of the account type referenced by accountTypeId.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "email",
            "description": "<p>Find accounts that have an email like the email query.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "username",
            "description": "<p>Find accounts that have a username like username query.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "include",
            "description": "<p>Include data that belongs to an account.  Include  can be either 'snippets' or 'accounttype'.</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "limit",
            "description": "<p>Return a limited number of accounts (maximum of 25).</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "offset",
            "description": "<p>Return results from the position specified by offset.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "accounts",
            "description": "<p>Accounts that where found by request.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'accounts': [\n    {\n      'id': 1\n      'username': 'some guy',\n      'email': 'someguy@someplace.com',\n      'accountTypeId': 1\n    },\n    <other accounts>\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/AccountController.js",
    "groupTitle": "Account"
  },
  {
    "type": "post",
    "url": "/api/account-types",
    "title": "Create account type",
    "version": "0.1.0",
    "name": "CreateAccountType",
    "group": "AccountType",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Authorization token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Authorization Header",
          "content": "'Authorization': 'Bearer <authorization token>'",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of account type.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of new account type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of new account type.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'id': 1\n  'name': 'other'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "TokenExpired",
            "description": "<p>Authorization token has expired.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "MissingName",
            "description": "<p>Request body does not have a name attribute.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidName",
            "description": "<p>Request body contains an invalid name attribute.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Api request does not have authorization to create an account type.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Forbidden",
            "description": "<p>Account making api request is not an admin account.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "TokenExpired Response",
          "content": "HTTP/1.1 422 TokenExpired\n{\n  'message': 'Jwt expired'\n}",
          "type": "json"
        },
        {
          "title": "MissingName Response",
          "content": "HTTP/1.1 422 MissingName\n{\n  'message': 'Missing account type name'\n}",
          "type": "json"
        },
        {
          "title": "InvalidName Response",
          "content": "HTTP/1.1 422 InvalidName\n{\n  'message': 'Invalid account type name'\n}",
          "type": "json"
        },
        {
          "title": "Unauthorized Response",
          "content": "HTTP/1.1 422 Unauthorized\n{\n  'message': 'Unauthorized'\n}",
          "type": "json"
        },
        {
          "title": "Forbidden Response",
          "content": "HTTP/1.1 422 Forbidden\n{\n  'message': 'Forbidden'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/AccountTypeController.js",
    "groupTitle": "AccountType"
  },
  {
    "type": "delete",
    "url": "/api/account-types/:id",
    "title": "Delete account type",
    "version": "0.1.0",
    "name": "DeleteAccountType",
    "group": "AccountType",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Authorization token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Authorization Header",
          "content": "'Authorization': 'Bearer <authorization token>'",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of account type to delete.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Account type deleted successfully.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'id': 1\n  'name': 'other'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "TokenExpired",
            "description": "<p>Authorization token has expired.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Api request does not have authorization to delete account type.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Forbidden",
            "description": "<p>Account making api request is not an admin account.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidName",
            "description": "<p>Request body contains an invalid name attribute.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotFound",
            "description": "<p>Account type to delete was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "TokenExpired Response",
          "content": "HTTP/1.1 401 TokenExpired\n{\n  'message': 'Jwt expired'\n}",
          "type": "json"
        },
        {
          "title": "Unauthorized Response",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  'message': 'Unauthorized'\n}",
          "type": "json"
        },
        {
          "title": "Forbidden Response",
          "content": "HTTP/1.1 403 Forbidden\n{\n  'message': 'Forbidden'\n}",
          "type": "json"
        },
        {
          "title": "InvalidName Response",
          "content": "HTTP/1.1 422 InvalidName\n{\n  'message': 'Invalid account type name'\n}",
          "type": "json"
        },
        {
          "title": "NotFound Response",
          "content": "HTTP/1.1 404 NotFound\n{\n  'message': 'Account type was not found'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/AccountTypeController.js",
    "groupTitle": "AccountType"
  },
  {
    "type": "get",
    "url": "/api/account-types/:id",
    "title": "Find an account type",
    "version": "0.1.0",
    "name": "FindAccountType",
    "group": "AccountType",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of account type.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of updated account type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of updated account type.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'id': 1\n  'name': 'other'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotFound",
            "description": "<p>Account type to was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "NotFound Response",
          "content": "HTTP/1.1 404 NotFound\n{\n  'message': 'Account type was not found'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/AccountTypeController.js",
    "groupTitle": "AccountType"
  },
  {
    "type": "get",
    "url": "/api/account-types",
    "title": "Find account types",
    "version": "0.1.0",
    "name": "FindAccountTypes",
    "group": "AccountType",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "id",
            "description": "<p>Id of account type.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>Name of account type.</p>"
          },
          {
            "group": "Parameter",
            "type": "integer",
            "optional": true,
            "field": "limit",
            "description": "<p>Return a limited number of accounts (maximum of 25).</p>"
          },
          {
            "group": "Parameter",
            "type": "integer",
            "optional": true,
            "field": "offset",
            "description": "<p>Return results from the position specified by offset.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "accountTypess",
            "description": "<p>Account types that where found by request.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'accountTypes': [\n    {\n      'id': 1\n      'name': 'admin'\n    },\n    <other account types>\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/AccountTypeController.js",
    "groupTitle": "AccountType"
  },
  {
    "type": "put",
    "url": "/api/account-types/:id",
    "title": "Update account type",
    "version": "0.1.0",
    "name": "UpdateAccountType",
    "group": "AccountType",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Authorization token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Authorization Header",
          "content": "'Authorization': 'Bearer <authorization token>'",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of account type to update.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>New account type name.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of updated account type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of updated account type.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'id': 1\n  'name': 'other'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "TokenExpired",
            "description": "<p>Authorization token has expired.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Api request does not have authorization to update account type.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Forbidden",
            "description": "<p>Account making api request is not an admin account.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidName",
            "description": "<p>Request body contains an invalid name attribute.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotFound",
            "description": "<p>Account type to update was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "TokenExpired Response",
          "content": "HTTP/1.1 401 TokenExpired\n{\n  'message': 'Jwt expired'\n}",
          "type": "json"
        },
        {
          "title": "Unauthorized Response",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  'message': 'Unauthorized'\n}",
          "type": "json"
        },
        {
          "title": "Forbidden Response",
          "content": "HTTP/1.1 403 Forbidden\n{\n  'message': 'Forbidden'\n}",
          "type": "json"
        },
        {
          "title": "InvalidName Response",
          "content": "HTTP/1.1 422 InvalidName\n{\n  'message': 'Invalid account type name'\n}",
          "type": "json"
        },
        {
          "title": "NotFound Response",
          "content": "HTTP/1.1 404 NotFound\n{\n  'message': 'Account type was not found'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/AccountTypeController.js",
    "groupTitle": "AccountType"
  },
  {
    "type": "put",
    "url": "/api/accounts/:id",
    "title": "Update account",
    "version": "0.1.0",
    "name": "UpdateAccount",
    "group": "Account",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Authorization token.  Must belong to the account that is getting updated, or an admin account.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Authorization Header",
          "content": "'Authorization': 'Bearer <authorization token>'",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of account to update.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Updated email address.</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "accountTypeId",
            "description": "<p>Updated account type id.  This parameter is restricted to admin account.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of updated account.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Username of updated account.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email address of updated account.</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "accountTypeId",
            "description": "<p>Id of updated account's account type.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'id': 1\n  'username': 'some-guy',\n  'email': 'someguy@someplace.com',\n  'accountTypeId': 1\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "TokenExpired",
            "description": "<p>Authorization token has expired.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Api request does not have authorization to update the account.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Forbidden",
            "description": "<p>Account making api request is not an administrative account, the account referenced by the id parameter, or a user account trying to change its own account type to admin.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "TokenExpired Response",
          "content": "HTTP/1.1 422 TokenExpired\n{\n  'message': 'Jwt expired'\n}",
          "type": "json"
        },
        {
          "title": "Unauthorized Response",
          "content": "HTTP/1.1 422 Unauthorized\n{\n  'message': 'Unauthorized'\n}",
          "type": "json"
        },
        {
          "title": "Forbidden Response",
          "content": "HTTP/1.1 422 Forbidden\n{\n  'message': 'Forbidden'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/AccountController.js",
    "groupTitle": "Account"
  },
  {
    "type": "post",
    "url": "/api/auth",
    "title": "Authenticate a user account.",
    "version": "0.1.0",
    "name": "AuthAccount",
    "group": "Authentication",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Account email.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Account password.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "account",
            "description": "<p>Account that was authenticated.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'account': {\n    'username': 'some guy',\n    'email': 'someguy@someplace.com',\n  },\n  'token': '<an authorization token>'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "MissingDetails",
            "description": "<p>Email or password was missing from POST request.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "FailAuth",
            "description": "<p>Failed to authenticate account.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "MissingDetails Response",
          "content": "HTTP/1.1 400 MissingDetails\n{\n  'message': 'Missing username or password'\n}",
          "type": "json"
        },
        {
          "title": "FailAuth Response",
          "content": "HTTP/1.1 401 FailAuth\n{\n  'message': 'Could not authenticate user'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/AuthController.js",
    "groupTitle": "Authentication"
  },
  {
    "type": "put",
    "url": "/api/auth",
    "title": "Refresh an account token.",
    "version": "0.1.0",
    "name": "RefreshToken",
    "group": "Authentication",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Authorization token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Authorization Header",
          "content": "'Authorization': 'Bearer <authorization token>'",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'token': '<an authorization token>'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "TokenExpired",
            "description": "<p>Authorization token has expired.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Api request does not have authorization token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "TokenExpired Response",
          "content": "HTTP/1.1 401 TokenExpired\n{\n  'message': 'Jwt expired'\n}",
          "type": "json"
        },
        {
          "title": "Unauthorized Response",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  'message': 'Unauthorized'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/AuthController.js",
    "groupTitle": "Authentication"
  },
  {
    "type": "get",
    "url": "/api/snippets/:id",
    "title": "Count snippets",
    "version": "0.1.0",
    "name": "CountSnippets",
    "group": "Snippet",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "id",
            "description": "<p>Id of snippet.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>Name of snippet.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "author",
            "description": "<p>Name of snippet's author.</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "authorId",
            "description": "<p>Id of snippet's author.</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "limit",
            "description": "<p>Return a limited count of snippets (maximum of 25).</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "offset",
            "description": "<p>Return results from the position specified by offset.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "count",
            "description": "<p>Number of snippets found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'count': 100\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/SnippetController.js",
    "groupTitle": "Snippet"
  },
  {
    "type": "post",
    "url": "/api/snippets",
    "title": "Create snippet",
    "version": "0.1.0",
    "name": "CreateSnippet",
    "group": "Snippet",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Authoriztion token.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Authorization Header",
          "content": "'Authorization': 'Bearer <authorization token>'",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of snippet.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "body",
            "description": "<p>Snippet content.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of new snippet.</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "authorId",
            "description": "<p>Id of snippet creator.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of new snippet.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "body",
            "description": "<p>Content of new snippet.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'id': 1,\n  'authorId': 1\n  'name': 'some snippet',\n  'body': 'body of new snippet'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "TokenExpired",
            "description": "<p>Authorization token has expired.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Api request does not have authorization to create a snippet.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "TokenExpired Response",
          "content": "HTTP/1.1 401 TokenExpired\n{\n  'message': 'Jwt expired'\n}",
          "type": "json"
        },
        {
          "title": "Unauthorized Response",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  'message': 'Unauthorized'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/SnippetController.js",
    "groupTitle": "Snippet"
  },
  {
    "type": "delete",
    "url": "/api/snippets/:id",
    "title": "Delete snippet",
    "version": "0.1.0",
    "name": "DeleteSnippet",
    "group": "Snippet",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Authoriztion token. Must belong to either the snippet author or an admin account.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Authorization Header",
          "content": "'Authorization': 'Bearer <authorization token>'",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of snippet to delete.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Message to inform user that snippet has been deleted.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'message': 'Snippet has been deleted'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "TokenExpired",
            "description": "<p>Authorization token has expired.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Api request does not have authorization to update the snippet.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotFound",
            "description": "<p>Snippet to update was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "TokenExpired Response",
          "content": "HTTP/1.1 401 TokenExpired\n{\n  'message': 'Jwt expired'\n}",
          "type": "json"
        },
        {
          "title": "Unauthorized Response",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  'message': 'Unauthorized'\n}",
          "type": "json"
        },
        {
          "title": "NotFound Response",
          "content": "HTTP/1.1 404 NotFound\n{\n  'message': 'Snippet was not found'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/SnippetController.js",
    "groupTitle": "Snippet"
  },
  {
    "type": "get",
    "url": "/api/snippets/:id",
    "title": "Find a snippet",
    "version": "0.1.0",
    "name": "FindSnippet",
    "group": "Snippet",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of snippet.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of found snippet.</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "authorId",
            "description": "<p>Id of snippet's author.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of found snippet.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "body",
            "description": "<p>Body of found snippet.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'id': 1\n  'authorId': 1,\n  'name': 'snippet-name',\n  'body': 'snippet body'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotFound",
            "description": "<p>Snippet to was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "NotFound Response",
          "content": "HTTP/1.1 404 NotFound\n{\n  'message': 'Snippet was not found'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/SnippetController.js",
    "groupTitle": "Snippet"
  },
  {
    "type": "get",
    "url": "/api/snippets",
    "title": "Find snippets",
    "version": "0.1.0",
    "name": "FindSnippets",
    "group": "Snippet",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "id",
            "description": "<p>Id of snippet.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>Name of snippet.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "author",
            "description": "<p>Name of snippet's author.</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "authorId",
            "description": "<p>Id of snippet's author.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "include",
            "description": "<p>Include data that belongs to an account.  Include can be 'author', which refers to account that created snippet.</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "limit",
            "description": "<p>Return a limited number of snippets (maximum of 25).</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "offset",
            "description": "<p>Return results from the position specified by offset.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "snippets",
            "description": "<p>Snippets that where found by request.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'snippets': [\n    {\n      'id': 1\n      'authorId': 1,\n      'name': 'snippet-name',\n      'body': 'snippet body'\n    },\n    <other snippets>\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/SnippetController.js",
    "groupTitle": "Snippet"
  },
  {
    "type": "get",
    "url": "/api/snippets/:username/:snippetname",
    "title": "Find a user snippet",
    "version": "0.1.0",
    "name": "FindUserSnippet",
    "group": "Snippet",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Name of snippet author.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "snippetname",
            "description": "<p>Name of snippet.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\nThis is a snippet body.  This route returns only a snippet body.",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/SnippetController.js",
    "groupTitle": "Snippet"
  },
  {
    "type": "put",
    "url": "/api/snippets/:id",
    "title": "Update snippet",
    "version": "0.1.0",
    "name": "UpdateSnippet",
    "group": "Snippet",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Authoriztion token. Must belong to the author of the snippet that will be updated.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Authorization Header",
          "content": "'Authorization': 'Bearer <authorization token>'",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of snippet to update.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>Name of updated snippet.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "body",
            "description": "<p>Content of updated snippet.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>Id of new snippet.</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "authorId",
            "description": "<p>Id of snippet creator.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of new snippet.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "body",
            "description": "<p>Content of new snippet.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success Response",
          "content": "HTTP/1.1 200 OK\n{\n  'id': 1,\n  'authorId': 1\n  'name': 'some snippet',\n  'body': 'body of new snippet'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "TokenExpired",
            "description": "<p>Authorization token has expired.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Api request does not have authorization to update the snippet.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotFound",
            "description": "<p>Snippet to update was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "TokenExpired Response",
          "content": "HTTP/1.1 401 TokenExpired\n{\n  'message': 'Jwt expired'\n}",
          "type": "json"
        },
        {
          "title": "Unauthorized Response",
          "content": "HTTP/1.1 401 Unauthorized\n{\n  'message': 'Unauthorized'\n}",
          "type": "json"
        },
        {
          "title": "NotFound Response",
          "content": "HTTP/1.1 404 NotFound\n{\n  'message': 'Snippet was not found'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/SnippetController.js",
    "groupTitle": "Snippet"
  }
] });
