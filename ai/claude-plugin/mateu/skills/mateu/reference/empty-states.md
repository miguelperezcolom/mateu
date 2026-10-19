# Empty states & skeletons

## EmptyState component

Friendly "nothing here yet" placeholder with an optional CTA. Listings/grids render one
automatically when empty (message from `Listing.emptyStateMessage`); use the component for
custom screens:

```java
Component empty = EmptyState.builder()
        .icon("📭").title("No bookings yet")
        .description("When you create a booking it will show up here.")
        .actionId("createBooking").actionLabel("Create your first booking")
        .build();

@Action Object createBooking() { return URI.create("/bookings/new"); }
```

## Skeleton component

Shimmering placeholder mimicking the loading content's shape. Variants: `text` (lines),
`card` (tile), `grid` (rows), `form` (label+field pairs); `count` repeats the shape.

```java
Component loading = new HorizontalLayout(
        Skeleton.builder().variant(SkeletonVariant.form).count(3).build(),
        Skeleton.builder().variant(SkeletonVariant.grid).count(5).build());
```

Typical use: initial value of a component field that an `OnLoad` action replaces with the
real content (`return new State(this)`).
