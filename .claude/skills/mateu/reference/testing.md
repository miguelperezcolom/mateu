# Testing & iterating on Mateu screens

A Mateu view-model is a **plain Java object**: fields are state, methods are actions.
That makes it cheap to test and to iterate locally — favour deterministic, in-memory
ports so a run never depends on a real database.

## In-memory repository (fast, deterministic)

Back an `AutoCrud` (or any port) with an in-memory `Map` while developing or in tests.
The screen is identical whether the repository is JPA or a `Map`.

```java
class ProductStore implements CrudStore<Product> {
    private final Map<String, Product> db = new LinkedHashMap<>();
    public Optional<Product> findById(String id) { return Optional.ofNullable(db.get(id)); }
    public String save(Product e) {
        var id = (e.id() == null || e.id().isBlank()) ? UUID.randomUUID().toString() : e.id();
        db.put(id, /* copy of e with id */ e);
        return id;
    }
    public List<Product> findAll() { return new ArrayList<>(db.values()); }
    public void deleteAllById(List<String> ids) { ids.forEach(db::remove); }
}
```

Keep it deterministic: `LinkedHashMap` (stable order), no clock/random in field defaults,
seed fixtures explicitly.

## Unit-test an action directly

Because the action is just a method on a POJO, you can call it and assert on the
resulting state — no HTTP, no renderer:

```java
@Test void greet_sets_message() {
    var s = new Saludo();
    s.name = "Ada";
    s.greet();
    assertThat(s.message).isEqualTo("Hi, Ada");
}
```

Assert on the **effect** when the action returns one:

```java
var effect = altaCliente.guardar();
assertThat(effect).isInstanceOf(Message.class);
```

## Round-trip test for orchestrators

For CRUD / editor / wizard orchestrators (where state arrives from the frontend), the
core test utilities drive a real action round-trip. Build a request and assert the
mutation — the editor test is the canonical example:

```java
view.save(new FakeHttpRequest(
    RunActionRqDto.builder()
        .parameters(Map.of("initiatorState", Map.of("name", "edited")))
        .build()));
assertThat(view.stored.name).isEqualTo("edited");
```

`FakeHttpRequest` + `RunActionRqDto` live in the core test utilities
(`io.mateu.core.testutil`). Use this level only when you need the hydrate→action→state
pipeline; for plain view-models, the direct method call above is enough.

## See it render

To validate the actual UI (not just logic), run a demo/SUT app and open the route — see
`CLAUDE.md` ("Generating Documentation Screenshots") for the Playwright one-shot script,
which doubles as a compile+render check: a class that doesn't compile or render produces
a blank screenshot.
