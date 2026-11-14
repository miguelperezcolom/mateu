# Lab 03 · Pruébala como un usuario (25′)

*[English](guide.md)* · Itinerarios: **Java**, **C#**, **Python** · Inicio: `<itinerario>/start` (= solución del lab 01) · Solución: `<itinerario>/solution`

Mateu trae un **arnés de pruebas**: ejecuta tu UI en el proceso del test, abre una ruta como lo hace
un renderer y deja que el test lea la pantalla y actúe sobre ella: campos, botones, listados, menús,
mensajes. Sin navegador, sin servidor, sin puerto: un test tarda milisegundos, y lee exactamente la
respuesta que dibuja cada renderer, así que un test que pasa vale para Vaadin, Redwood, el móvil y la
app de escritorio.

| | Java | C# | Python |
|---|---|---|---|
| Dónde | `io.mateu:mateu-test` (scope test, ya está en el `pom.xml` generado) | `Mateu.AspNetCore.Testing` (en el paquete `Mateu.AspNetCore`) | `mateu_ui.testing` (en `mateu-ui`) |
| Arrancar | `MateuTest.builder().scan("com.example.workshop").start()` | `MateuTest.Start(typeof(Quote).Assembly)` | `MateuTest(views)` |
| Abrir una pantalla | `mateu.open("/quote")` | `mateu.Open("/quote")` | `mateu.open("/quote")` |

## 1. Lee el test del starter (3′)

**Java** ya tiene uno: `src/test/java/.../ProductsUiTest.java`: abre `/products`, cuenta las filas,
busca, crea un producto con el formulario **New** y comprueba que se rechaza un producto sin nombre.
Ejecútalo: `mvn test`.

**C#** — crea el proyecto de tests junto a la app:

```bash
dotnet new xunit -o Workshop.Tests
dotnet add Workshop.Tests reference Workshop.csproj
```

y déjalo fuera del proyecto web; en `Workshop.csproj`:

```xml
<ItemGroup>
  <Compile Remove="Workshop.Tests/**" />
  <Content Remove="Workshop.Tests/**" />
  <None Remove="Workshop.Tests/**" />
</ItemGroup>
```

(La solución fija `Microsoft.NET.Test.Sdk` 17.11.1, `xunit` 2.9.3, `xunit.runner.visualstudio` 2.8.2.)

**Python** — `test_starter.py` es el test de humo del starter; escribirás `test_quote.py` a su lado.

## 2. Prueba tu Quote (12′)

Los ids de los campos son los mismos en los tres lenguajes (`quantity`, `unitPrice`, `discount`,
`total`); un campo también se encuentra por su etiqueta, y un botón por su etiqueta o su acción.

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

(`mateu` sale de `MateuTest.builder().scan("com.example.workshop").start()` en un `@BeforeEach`, y se
cierra en `@AfterEach`: copia el patrón de `ProductsUiTest`.)

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

Ejecuta: `mvn test` · `dotnet test Workshop.Tests` · `pytest -q`.

**Rómpelo a propósito**: haz que `calculate` devuelva solo el `Message` (quita la vista). El test
falla con *expected 27, was 0*: el aviso salió, el total nunca llegó a la pantalla. Es el bug que te
habría reportado un usuario; el arnés te lo dice en milisegundos.

## 3. Prueba la regla del stock y el menú (10′)

Escribe dos más, en tu lenguaje (la solución los tiene todos):

- **El menú lleva al presupuesto** — Java: `mateu.open("/").openMenu("Quote")` y luego
  `assertEquals("/quote", app.route())`; C#: `Assert.Contains("Quote", mateu.Open("/").Menu)`;
  Python: `assert "Quote" in MateuTest(views).open("/").menu`.
- **Un stock negativo se rechaza** — abre `/products`, pulsa **New**, rellena `id`, `name`, `price`,
  `stock = -1`, `status`, pulsa **Save**; el último mensaje es un error y el almacén no tiene ese
  producto. (Java/C#/Python: `lastMessage().isError()` / `LastMessage.IsError` / `last_message.is_error`.)

Cuando un campo o un botón no está, el fallo enumera lo que hay:
`No field "unit_price" on /quote. Fields: [quantity, unitPrice, discount, total]`.

✅ **Checkpoint**: 4 tests nuevos en verde (`QuoteUiTest` / `QuoteUiTests` / `test_quote.py`), y has
visto uno fallar por el motivo correcto.

## Lo que no hace

El arnés ejecuta la parte servidor. Las reglas de cliente, las fuentes REST que llama el navegador y
el aspecto (layout, temas) se informan tal como se declaran, sin evaluarlos: las pruebas de captura
son cosa de los renderers. Java: un arnés por JVM a la vez (sin tests de arnés en paralelo).

## Extra

- Listado: `products.listing().search("grinder")` y comprueba `rows()` / `Rows` / `rows`.
- Abre una fila: `listing().row("Milk frother").open()` y lee el `name` del detalle.
- El lab 06 prueba reglas de acceso con una identidad: `mateu.open("/quote", Identity.withRoles("manager"))`.
