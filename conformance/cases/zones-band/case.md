# zones-band

Pins how a `@Zones` form lays out a section that names NO zone: it is a full-width band, stacked in
declaration order, and the run of zoned sections between the bands collapses into ONE row of
columns at its position. The fixture declares `[Contact (no zone), Account (left), Customer
(right), Notes (no zone)]`, so the answer is a VerticalLayout of the Contact card, a ResponsiveGrid
with the left/right columns, and the Notes card.

Worth pinning because the .NET and Python ports (3.0.0) put the un-zoned sections into an extra
trailing column instead (`62% 1fr 1fr`, every section side by side), while the existing `zones`
case — every section zoned — could not tell the difference.
