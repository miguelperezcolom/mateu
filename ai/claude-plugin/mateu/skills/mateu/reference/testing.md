# Testing & iterating on Mateu screens

A Mateu view model is a **plain Java object**: fields are state, methods are actions.
That makes it cheap to test and to iterate locally — favour deterministic, in-memory
ports so a run never depends on a real database.

## In-memory store (fast, deterministic)

Back an `AutoCrud` (or any port) with an in-memory `Map` while developing or in tests.
The screen is identical whether the store is JPA or a `Map`. Keep the map `static` (or in a
singleton service): the view model itself is re-created on every request.

```java
static class ProductStore implements CrudStore<Product> {
    private static final Map<String, Product> db = new LinkedHashMap<>();
    public Optional<Product> findById(String id) { return Optional.ofNullable(db.get(id)); }
    public String save(Product e) {
        var id = (e.id() == null || e.id().isBlank()) ? UUID.randomUUID().toString() : e.id();
        db.put(id, new Product(id, e.name(), e.description(), e.status()));
        return id;
    }
    public List<Product> findAll() { return new ArrayList<>(db.values()); }
    public void deleteAllById(List<String> ids) { ids.forEach(db::remove); }
}
```

Keep it deterministic: `LinkedHashMap` (stable order), no clock/random in field defaults,
seed fixtures explicitly.

## Unit-test an action directly

Because the action is just a method on a POJO, call it and assert on the resulting state —
no HTTP, no renderer (same package as the view, since fields are package-private):

```java
@Test void greet_sets_message() {
    var g = new Greeting();
    g.name = "Ada";
    g.greet();
    assertThat(g.message).isEqualTo("Hi, Ada");
}
```

Assert on the **effect** when the action returns one:

```java
assertThat(new AltaCliente().guardar()).isInstanceOf(Message.class);
```

## Round-trip test through the wire (orchestrators, hydration, strict actions)

For CRUD / editor / wizard orchestrators — where state arrives from the browser — boot the app
and drive the same endpoint the renderer calls, `POST /mateu/v3/sync/<route>` with a JSON body
(`route`, `actionId` — `""` loads —, `serverSideType` = the view's class for actions,
`componentState` = the field values):

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GreetingWireTest {

  @LocalServerPort int port;

  String sync(String route, String actionId, String serverSideType, String stateJson) throws Exception {
    var body = """
        {"route":"%s","consumedRoute":"","actionId":"%s","serverSideType":"%s","componentState":%s}
        """.formatted(route, actionId, serverSideType, stateJson);
    var rq = java.net.http.HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/mateu/v3/sync" + route))
        .header("Content-Type", "application/json")
        .POST(java.net.http.HttpRequest.BodyPublishers.ofString(body))
        .build();
    var rs = HttpClient.newHttpClient().send(rq, HttpResponse.BodyHandlers.ofString());
    assertThat(rs.statusCode()).isEqualTo(200);   // 403 = the action is not marked (strict mode)
    return rs.body();
  }

  @Test void greetingRendersAndGreets() throws Exception {
    assertThat(sync("/greeting", "", "", "{}")).contains("\"fieldId\":\"name\"");
    assertThat(sync("/greeting", "greet", "com.example.app.Greeting", "{\"name\":\"Ada\"}"))
        .contains("Hi, Ada");
  }
}
```

(`spring-boot-starter-test` in test scope. `java.net.http.HttpRequest` is spelled out because
Mateu's `HttpRequest` interface has the same simple name.)

## See it render

To validate the actual UI (not just logic), run the app and screenshot the route — the
**mateu-run** skill has the Playwright one-shot script, which doubles as a compile+render
check: a class that doesn't compile or render produces a blank screenshot.
