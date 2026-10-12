# crud-grouped

Pins listing aggregation on the wire: an `@Aggregate(sum)` column and an `@Aggregate(count)` column carry their function (`aggregate`), and the `@GroupBy` column is named on the Crud metadata (`groupBy: "region"`), so the renderer draws the totals footer and the group headers. The totals themselves travel with the search result; this case pins the declaration every backend must emit for them to be drawn at all.

Like `crud`, it is a MEDIATED case: the corpus pins Java's content load, without the mediator protocol (the component's `actions`, `initialData` and the fragment `state`).
