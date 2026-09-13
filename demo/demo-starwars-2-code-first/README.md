# Example 2 — the first line of Java: a code-first CRUD

**Example 2** of the progressive Star Wars suite. Example 1 (`demo-starwars`) declared a whole app
as YAML over an external API, with no Java UI at all. This one takes the other on-ramp: **declare the
model as a Java record and let Mateu render the CRUD from it** — no YAML, no external API, no
database.

## What it demonstrates

One annotated class is the entire UI:

```java
@UI("")                                   // mounted at the app root
public class Characters extends AutoCrud<Character> {
  @Override public CrudStore<Character> store() { return CharacterStore.INSTANCE; }
}
```

From the `Character` record Mateu infers everything you saw hand-written in Example 1's YAML:

- the **listing** (one column per record component) with search, column chooser and selection,
- the **create / edit** forms, grouped into the `@Section`s the record declares,
- **validation** from the bean-validation annotations (`@NotEmpty` name, `@Min(0)` height),
- field widgets from the types: the `Gender` enum becomes a select, `int height` a stepper,
- the full **create / edit / delete** flow, wired to the store.

```java
record Character(
    @Section("Identity") @EditableOnlyWhenCreating @NotEmpty String id,
    @NotEmpty String name,
    Gender gender,
    String birthYear,
    @Section("Physical") @Min(0) int height,
    double mass,
    String homeworld) implements Identifiable { … }
```

The data-access port is a tiny in-memory `CrudStore<Character>` seeded with a handful of characters —
swap it for a JPA-backed one and nothing above changes. `AutoCrud` calls its `find(...)` (default:
filter + sort + paginate over `findAll()`) to fill the listing, and `save` / `deleteAllById` for the
writes.

## The step from Example 1

| | Example 1 (`demo-starwars`) | Example 2 (this) |
|---|---|---|
| Authoring | YAML (`specs/ui/**`) | Java `@UI` + record |
| Data | external API (swapi) | in-memory `CrudStore` |
| Java UI code | none | one class + its store |
| CRUD | hand-declared per screen | inferred from the model |

Same rendered result kind (a CRUD), reached from the opposite end of the authoring spectrum. The next
examples add rich forms, archetypes and an app shell, then federation and a static bundle.

## Run it

```bash
cd demo/demo-starwars-2-code-first
mvn -s ../../settings.xml spring-boot:run     # → http://localhost:8601
```

Open <http://localhost:8601> — the listing is the root; **New** creates, a row opens the editor,
**Delete** removes the selected rows. Edits live in memory for the life of the process.
