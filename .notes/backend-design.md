I'm thinking each draft is a "lobby" that players can join.
Once in, each player creates a socket connection to the server.

The server will have a list of lobbies, and each lobby will have a list of players.
As players complete actions, the socket connection will send the updated state to the server and the server will send the updated state back to other users.

## ALTERNATIVE APPROACH

Actually, we could just use firestore snapshots to keep track of the lobbies and players.

Each lobby would have a document with a list of players.
As players join, each other player's snapshot would be updated with the new player.
Each lobby then has a packs subcolelction, which would contain one pack document for each player.
Packs are moved around in draft order, and each card has "pickedBy" and "pickedAt" fields.
