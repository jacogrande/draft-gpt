Okay, so I'm gonna need to LOCK down Firestore with some pretty hardcore rules.
I'm gonna try and keep track of what rules are required here.

The C.I. _(Commander's Intent)_ is that users should only be able to modify lobbies if they're the lobby "creator" or if they're adding or removing a value that contains their own user id, thus limiting client side interactions to values scoped exclusively to that user.
