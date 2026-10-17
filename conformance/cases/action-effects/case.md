# action-effects

Pins what an ACTION answers on the envelope, not what a first load draws (`request.json`:
`actionId: confirm`). The action returns, in one collection, a success toast with an explicit
4000 ms duration, an error toast and a navigation — so the case pins `messages` (variant,
position, title, text, duration) and `commands` (`NavigateTo` with its route), and that a
collection maps element by element, in order, in the three servers.

The error toast is the point of the second message: every backend makes an error **sticky**
(`duration: 0`, whatever the author asked for), and `0` is exactly the value the "absent ==
default" normalisation would otherwise hide — `duration` is one of the members whose zero is
meaningful (see the normalisation section of `conformance/README.md`), so a server that omitted it
would show the web renderer's default timeout instead and fail here.
