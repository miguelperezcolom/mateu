# Hero search landing page

Extend `HeroSearch<Filters, Row>` (io.mateu.core.infra.declarative.orchestrators.herosearch)
for a search-first landing page: big hero header + prominent search box + filter facets +
card results. Implement `search(...)` exactly like a declarative `Listing`.

```java
@UI("/hotel-search")
@Title("Hotel search")
public class HotelSearch extends HeroSearch<HotelFilters, Hotel> {

    public record HotelFilters(String zone, Integer minStars) {}   // fields → facets
    public record Hotel(String name, String zone, int stars, String price) {}  // → result cards

    @Override protected String heroTitle() { return "Find your hotel"; }
    @Override protected String heroSubtitle() { return "Search by name or zone…"; }
    // @Override protected String heroImage() { return "/images/hero.jpg"; }  // optional bg

    @Override
    public ListingData<Hotel> search(String searchText, HotelFilters filters,
                                     Pageable pageable, HttpRequest req) {
        // query use case with searchText + filters + pageable → ListingData page
    }
}
```

- Results default to `GridLayout.cards` — override `gridLayout()` for table/list.
- Starts empty (distraction-free); add `@Trigger(type = TriggerType.OnLoad, actionId =
  "search")` on the class to preload.
- `HeroSection` is also a standalone fluent component (title, subtitle, image, centered,
  content slot) — compose it with anything from `ComponentTreeSupplier` (welcome pages, etc.).

Use when searching IS the task (catalogs, pickers, knowledge bases); use `AutoCrud`/`Listing`
for working the collection (bulk edits, exports).
