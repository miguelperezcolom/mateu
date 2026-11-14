# Lab 03 · Test it like a user (25′)

*[Español](guide.es.md)* · Tracks: **Java**, **C#**, **Python** · Start: `<track>/start` (= lab 01's solution) · Solution: `<track>/solution`

Mateu ships a **test harness**: it runs your UI in the test's process, opens a route the way a
renderer does, and lets the test read the screen and act on it — fields, buttons, listings, menus,
messages. No browser, no server, no port: a test runs in milliseconds, and it reads the very answer
every renderer draws, so a passing test holds on Vaadin, Redwood, the phone and the desktop app.

| | Java | C# | Python |
|---|---|---|---|
| Where | `io.mateu:mateu-test` (test scope, already in the generated `pom.xml`) | `Mateu.AspNetCore.Testing` (in the `Mateu.AspNetCore` package) | `mateu_ui.testing` (in `mateu-ui`) |
| Start | `MateuTest.builder().scan("com.example.workshop").start()` | `MateuTest.Start(typeof(Quote).Assembly)` | `MateuTest(views)` |
| Open a screen | `mateu.open("/quote")` | `mateu.Open("/quote")` | `mateu.open("/quote")` |

## 1. Read the starter's test (3′)

**Java** has one already: `src/test/java/.../ProductsUiTest.java` — it opens `/products`, counts the
rows, searches, creates a product through the **New** form, and checks that a nameless product is
refused. Run it: `mvn test`.

**C#** — create the test project next to the app:

```bash
dotnet new xunit -o Workshop.Tests
dotnet add Workshop.Tests reference Workshop.csproj
```

and keep it out of the web project — in `Workshop.csproj`:

```xml
<ItemGroup>
  <Compile Remove="Workshop.Tests/**" />
  <Content Remove="Workshop.Tests/**" />
  <None Remove="Workshop.Tests/**" />
</ItemGroup>
```

(The solution pins `Microsoft.NET.Test.Sdk` 17.11.1, `xunit` 2.9.3, `xunit.runner.visualstudio` 2.8.2.)

**Python** — `test_starter.py` is the starter's smoke test; you will write `test_quote.py` next to it.

## 2. Test your Quote (12′)

Field ids are the same in the three languages (`quantity`, `unitPrice`, `discount`, `total`); a field
can also be found by its label, a button by its label or its action.

**Java** — `src/test/java/com/example/workshop/QuoteUiTest.java`:

```java
@Test
void calculateFillsInTheTotal() {
  var quote = mateu.open("/quote");
  quote.field("quantity").set(3);
  quote.field("unitPrice").set(10.0);
  quote.field("discount").set(10);
  quote.button("Calculate").press();

  assertEquals(27.0, ((Number) quote.field("total").value()).doubleValue());
  assertTrue(quote.field("total").readOnly());
  assertTrue(quote.lastMessage().text().contains("27"));
}
```

(`mateu` comes from `MateuTest.builder().scan("com.example.workshop").start()` in a `@BeforeEach`,
closed in `@AfterEach` — copy the pattern of `ProductsUiTest`.)

**C#** — `Workshop.Tests/QuoteUiTests.cs`:

```csharp
[Fact]
public void Calculate_fills_in_the_total()
{
    using var mateu = MateuTest.Start(typeof(Quote).Assembly);
    var quote = mateu.Open("/quote");
    quote.Field("quantity").Set(3);
    quote.Field("unitPrice").Set(10.0);
    quote.Field("discount").Set(10);
    quote.Button("Calculate").Press();

    Assert.Equal(27.0, quote.Field("total").Value!.GetValue<double>());
    Assert.True(quote.Field("total").ReadOnly);
    Assert.Contains("27", quote.LastMessage.Text);
}
```

**Python** — `test_quote.py`:

```python
from mateu_ui.testing import MateuTest

import views


def test_calculate_fills_in_the_total():
    quote = MateuTest(views).open("/quote")
    quote.field("quantity").set(3)
    quote.field("unitPrice").set(10.0)
    quote.field("discount").set(10)
    quote.button("Calculate").press()

    assert quote.field("total").value == 27.0
    assert quote.field("total").read_only
    assert "27" in quote.last_message.text
```

Run: `mvn test` · `dotnet test Workshop.Tests` · `pytest -q`.

**Break it on purpose**: make `calculate` return only the `Message` (drop the view). The test fails
with *expected 27, was 0* — the toast showed, the total never reached the screen. This is the bug a
user would have reported; the harness reports it in milliseconds.

## 3. Test the stock rule and the menu (10′)

Write two more, in your language (the solution has all of them):

- **The menu leads to the quote** — Java: `mateu.open("/").openMenu("Quote")` then
  `assertEquals("/quote", app.route())`; C#: `Assert.Contains("Quote", mateu.Open("/").Menu)`;
  Python: `assert "Quote" in MateuTest(views).open("/").menu`.
- **A negative stock is refused** — open `/products`, press **New**, fill `id`, `name`, `price`,
  `stock = -1`, `status`, press **Save**; the last message is an error and the store has no such
  product. (Java/C#/Python: `lastMessage().isError()` / `LastMessage.IsError` / `last_message.is_error`.)

When a field or a button is not there, the failure lists what there is:
`No field "unit_price" on /quote. Fields: [quantity, unitPrice, discount, total]`.

✅ **Checkpoint**: 4 new tests green (`QuoteUiTest` / `QuoteUiTests` / `test_quote.py`), and you saw
one fail for the right reason.

## What it does not do

The harness runs the server side. Client-side rules, REST sources called from the browser and looks
(layout, themes) are reported as declared, not evaluated — screenshot tests belong to the renderers.
Java: one harness per JVM at a time (no parallel harness tests).

## Stretch

- Listing: `products.listing().search("grinder")`, then assert on `rows()` / `Rows` / `rows`.
- Open a row: `listing().row("Milk frother").open()` and read the detail's `name`.
- Lab 06 tests access rules with an identity: `mateu.open("/quote", Identity.withRoles("manager"))`.
