# card-menu

Pins a card menu authored in code (AppSupplier / IAppSupplier / AppSupplier): a menu group that
opens as a panel of CARDS (`display: "cards"`), whose entry is a card carrying its `description`.
Every renderer draws the panel from exactly these
members (web `mateu-card-menu`, Redwood action cards, React Native drawer cards, IntelliJ two-line
rows), so a port dropping `display` or `description` would silently turn the cards back into a list.

Kept to ONE level on purpose: a code-authored group nested inside a group gets its route doubled by
Java's AppMenuDtoBuilder (`/b` › `/b/r` › `/b/r/search` becomes `/b/b/r/b/r/search`; the existing
`app-in-code` golden already pins a leaf as `/g/g/x`), and the ports differ on the nested group's
own path. Reported for the shell/menus area rather than frozen here.
