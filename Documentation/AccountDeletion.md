## Account deletion

#### Receive & handle account deletion request + response

`server/settings/controllers/AccountSettingsController.js`
`async deleteAccount(req, res) {}`

##### Logic flow

**1. Initial error handling**
1. Check if request body exists, else return error;
2. Check if request body contains userId, else return error;
3. Check if request body contains user password;

**2. Attempt delete**
1. Try account deletion
2. If error, set `exceptionError` to errors object
3. Return errors object to client with status 500.

**(3. Scenario with error: Post error handling)**
1. If errors or no success, prepare sending error messsage to client
2. If `PasswordDoesNotMatchError`, then add to errors object
3. If `UserNotFoundError`, then add to errors object
4. If `UnknownError`, then add to errors object
5. Return errors object to client with status 500.

**(3. Scenario with no error: Post success handling)**
1. If success is returned, send success to client with status 200.



If any part of the delete failed,
mark that in deleteErrors data model,
and keep log of failedToDeleteItems 
that must be deleted