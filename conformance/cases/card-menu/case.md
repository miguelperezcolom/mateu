# card-menu

Pins a card menu authored in code (AppSupplier / IAppSupplier / AppSupplier): a menu group that
opens as a panel of CARDS (`display: "cards"`), whose entry is a card carrying its `description`.
Every renderer draws the panel from exactly these
members (web `mateu-card-menu`, Redwood action cards, React Native drawer cards, IntelliJ two-line
rows), so a port dropping `display` or `description` would silently turn the cards back into a list.

Kept to ONE level on purpose. (A code-authored entry spelled with its group's path — `/b` › `/b/r` —
used to be doubled by the menu builders, `/b/b/r`; since the fix every server resolves it once, as
the `app-in-code` golden pins with `/g` › `/g/x`.)
