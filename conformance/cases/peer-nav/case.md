# peer-nav

Pins the canonical page header's previous/next record links: a page implementing
`PeerNavigationSupplier` (Java) / `IPeerNavigationSupplier` (.NET) / `PeerNavigationSupplier`
(Python) carries `peerNav {prevLabel, prevRoute, nextLabel, nextRoute}` on its page metadata. Every
renderer draws them (the web header, React Native and IntelliJ since the native-ports walkthrough),
so a port dropping or renaming a member would leave the arrows dead on every client at once.
