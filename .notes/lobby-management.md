Okay, so I'm struggling a little bit with using snapshots for lobby management.
It's very easy to track when a user joins a lobby, but it's much harder to track when a user leaves a lobby.

My first approach was to try and take advantage of the `window.onbeforeunload` event, but there are a ton of edge cases introduced by this approach.
First off, it only works half the time lol. I can't find a pattern as to why it works on the browser's back button half the time and not the other half.
Secondly, if our tab isn't active when it's closed, the event won't fire.

I'm guessing the move is to use some sort of heartbeat system, but even that has an edge case during the time between the user leaving and the next heartbeat triggering.

Time to talk to Claude.

Okay, so it seems like Cloud Realtime Database has a "Presence" feature that would be perfect for this. It can listen for changes in a user's connection (closed tab, dropped internet, etc). The question once again becomes: Once a user is disconnected, how do we trigger an update to the lobby document?

An easy way would be to use cloud function triggers, but I would like to see if there's a Remix way to do this.

Okay, so we're off the "Presence" trail, and we're going back to the heartbeat system.
I think the tradeoff here (which I deem worth taking) is that we'll accept lobby state latency, but we'll gain a whole bunch of simplicity.

The design now is to have a `useHeartbeat` hook that A) updates the user's `lastSeen` timestamp in the lobby every few seconds (this is the heartbeat),
and B) periodically rids the lobby of users who haven't been seen in a while. The idea is that as the size of `activeUsers` go up, the `activeUser` tracking latency goes down.

This brings up a new problem: What happens when a user creates a lobby, then leaves it before anyone else joins?
If we don't catch that unload event, the lobby will still show that 1 user is active until someone else joins. We don't want that at all.
GPT o1 suggested that we add a `lastActive` timestamp to the lobby document, filtering out old lobbies while getting the lobby list snapshot.
