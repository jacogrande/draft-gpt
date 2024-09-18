So I'm going with using the firebase client sdk for pretty much everything. There won't even really be a backend. Lobbies will be modified by the client.
Okay, there's just no way that's chill. Maybe I can have the client sdk and the admin sdk? And I can use the admin sdk in remix action routes?

## Protecting Routes

This is a little bit tricky. We'll need to attach the user's idToken to a session cookie that gets verified in route loader functions.

Attaching the cookie to a session requires the client sending the idToken to an api endpoint that verifies the token and attaches it to the session cookie.

I just got it working. Here's how:

- In the `onAuthStateChanged` callback, we kick off the process of attaching the users idToken to the session cookie.
- We do this by using the current authed user's idToken to make a request to the `/api/session` endpoint.
- The endpoint verifies the idToken and attaches it to the session cookie, attaching the cookie to the response header.
- For every route that requires a logged in user, we use the `verifySession` loader function to verify the session cookie.
- If the session cookie is not found or the idToken is invalid, the user is redirected to the `/join` page.
