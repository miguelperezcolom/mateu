using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

// ── Component adapters ─────────────────────────────────────────────────────────────

/// <summary>A plain domain object: no Mateu form attributes; its UI is PedidoAdapter's. The [UI]
/// only gives it a route (mirrors the Java demo's Pedido).</summary>
[UI("pedido")]
public class Pedido
{
    public string Referencia = "PED-2026-0042";
    public string Cliente = "Bodegas Riojanas S.A.";
    public long Cantidad = 12;

    internal Message Guardar() => new($"Pedido guardado: {Referencia} · {Cliente} · {Cantidad} uds");
}

public class PedidoAdapter : ComponentAdapter<Pedido>
{
    public override AdaptedView Adapt(Pedido pedido) => AdaptedView.Of(
        new VerticalLayout
        {
            Content =
            [
                new FormField { FieldId = "referencia", Label = "Referencia" },
                new FormField { FieldId = "cliente", Label = "Cliente" },
                new Button("Guardar", "guardar"),
            ],
        },
        new Dictionary<string, object?>
        {
            ["referencia"] = pedido.Referencia, ["cliente"] = pedido.Cliente, ["cantidad"] = pedido.Cantidad,
        },
        ["guardar"]);

    // only overwrite the keys present, so the initializers survive the empty initial state
    public override Pedido Deserialize(IReadOnlyDictionary<string, object?> state)
    {
        var p = new Pedido();
        if (state.TryGetValue("referencia", out var r)) p.Referencia = (string)r!;
        if (state.TryGetValue("cliente", out var c)) p.Cliente = (string)c!;
        if (state.TryGetValue("cantidad", out var q)) p.Cantidad = Convert.ToInt64(q);
        return p;
    }
}

/// <summary>A normal form holding an adapted value: the value renders as an island.</summary>
[UI("documento-con-pedido"), Title("Documento con pedido")]
public class AdapterHost
{
    public string? Documento { get; set; } = "DOC-2026-0007";
    public Pedido Pedido { get; set; } = new();
}

/// <summary>A domain type whose adapter is NOT discoverable by scan (no parameterless
/// constructor): only a DI registration makes it known.</summary>
[UI("greeting")]
public class Greeting
{
    public string Who = "world";
}

public class GreetingAdapter(string prefix) : ComponentAdapter<Greeting>
{
    public override AdaptedView Adapt(Greeting g) => AdaptedView.Of(new Text($"{prefix} {g.Who}"));
    public override Greeting Deserialize(IReadOnlyDictionary<string, object?> state) => new();
}

// ── Embedded islands ───────────────────────────────────────────────────────────────

/// <summary>An island in its "has data" state (mirrors the front-office DocumentoView).</summary>
[UI("documento"), Title("Documento")]
public class DocumentoView
{
    public int StayId { get; set; }
    public string? Numero { get; set; } = "12345678X";

    [Kpi("Stay")] public string StayKpi() => StayId.ToString();

    /// <summary>The island's next state is another view: it re-renders in place.</summary>
    [Button] public DocumentoEditor Editar() => new() { StayId = StayId, Numero = Numero };
}

[UI("documento-editor"), Title("Editar documento")]
public class DocumentoEditor
{
    public int StayId { get; set; }
    public string? Numero { get; set; }

    [Button] public Message Guardar() => new($"Guardado {Numero} (estancia {StayId})");
}

[UI("estancia"), Title("Estancia")]
public class EstanciaHost
{
    public string? Huesped { get; set; } = "María";

    [Inline] public DocumentoView Documento { get; set; } = new() { StayId = 7 };
}

[UI("estancia-plain"), Title("Estancia")]
public class EstanciaPlainHost
{
    public DocumentoView Documento { get; set; } = new() { StayId = 9 };
}


/// <summary>Component adapters (Java's ComponentAdapter SPI) and routed views embedded as
/// independent islands (Java's EmbeddedOrchestratorFieldBuilder).</summary>
public class IslandTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(IslandTests).Assembly));

    private static JsonNode Node(object o) => JsonSerializer.SerializeToNode(o, Json)!;

    private static IEnumerable<JsonObject> Objects(JsonNode? node)
    {
        switch (node)
        {
            case JsonObject o:
                yield return o;
                foreach (var (_, v) in o)
                foreach (var x in Objects(v)) yield return x;
                break;
            case JsonArray a:
                foreach (var v in a)
                foreach (var x in Objects(v)) yield return x;
                break;
        }
    }

    [Fact]
    public void An_adapted_route_renders_the_adapter_components_with_its_state_and_actions()
    {
        var inc = Handler().Handle(new RunActionRqDto { Route = "pedido", ConsumedRoute = "pedido" });
        var root = Node(inc);
        Assert.Empty(inc.Commands); // no page → no window title
        var component = root["fragments"]![0]!["component"]!;
        Assert.Equal(typeof(Pedido).FullName, (string?)component["serverSideType"]);
        Assert.Equal("width: 100%;", (string?)component["style"]);
        Assert.Equal("Bodegas Riojanas S.A.", (string?)component["initialData"]!["cliente"]);
        Assert.Equal(12, (long)component["initialData"]!["cantidad"]!);
        Assert.Equal("guardar", (string?)Assert.Single(component["actions"]!.AsArray())!["id"]);
        Assert.Contains(Objects(component), o => (string?)o["fieldId"] == "referencia");
    }

    [Fact]
    public void An_adapted_action_runs_on_the_model_rebuilt_from_the_state()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "pedido", ActionId = "guardar", ServerSideType = typeof(Pedido).FullName,
            // cantidad is absent: the initializer survives the round trip
            ComponentState = new() { ["cliente"] = JsonSerializer.SerializeToElement("Acme") },
        });
        Assert.Equal("Pedido guardado: PED-2026-0042 · Acme · 12 uds", Assert.Single(inc.Messages).Text);
    }

    [Fact]
    public void An_action_the_adapted_view_does_not_declare_is_refused()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "pedido", ActionId = "toString", ServerSideType = typeof(Pedido).FullName,
        });
        Assert.Equal("Action not found: toString", Assert.Single(inc.Messages).Text);
    }

    [Fact]
    public void An_adapted_property_of_a_form_renders_as_an_independent_island()
    {
        var root = Node(Handler().Handle(new RunActionRqDto { Route = "documento-con-pedido" }));
        var host = root["fragments"]![0]!["component"]!;
        // the island's state is its own, not the host's
        Assert.Null(host["initialData"]!["pedido"]);
        Assert.Equal("DOC-2026-0007", (string?)host["initialData"]!["documento"]);
        var cell = Assert.Single(Objects(host), o => (string?)o["type"] == "CustomField");
        Assert.Equal(2, (int)cell["colspan"]!);
        var island = cell["content"]!;
        Assert.Equal("ServerSide", (string?)island["type"]);
        Assert.Equal(typeof(Pedido).FullName, (string?)island["serverSideType"]);
        Assert.Equal("PED-2026-0042", (string?)island["initialData"]!["referencia"]);
    }

    [Fact]
    public void AddMateu_registers_the_adapters_of_the_container()
    {
        var sc = new ServiceCollection();
        sc.AddSingleton<IComponentAdapter>(new GreetingAdapter("Hola"));
        sc.AddMateu(typeof(IslandTests).Assembly);
        var handler = sc.BuildServiceProvider().GetRequiredService<SyncHandler>();
        var json = JsonSerializer.Serialize(handler.Handle(new RunActionRqDto { Route = "greeting" }), Json);
        Assert.Contains("\"text\":\"Hola world\"", json);
    }

    [Fact]
    public void An_embedded_view_is_a_mediator_island_seeded_with_the_host_configured_values()
    {
        var root = Node(Handler().Handle(new RunActionRqDto { Route = "estancia" }));
        var host = root["fragments"]![0]!["component"]!;
        Assert.Null(host["initialData"]!["documento"]);
        var cell = Assert.Single(Objects(host), o => (string?)o["type"] == "CustomField");
        Assert.Equal("", (string?)cell["label"]); // [Inline]: the host section frames it
        var island = cell["content"]!;
        Assert.Equal(typeof(DocumentoView).FullName, (string?)island["serverSideType"]);
        Assert.Equal("/documento?_embeddedMediator=1&_inline=1", (string?)island["route"]);
        var data = island["initialData"]!;
        Assert.True((bool)data["_embeddedMediator"]!);
        Assert.True((bool)data["_inline"]!);
        Assert.Equal(7, (int)data["stayId"]!);
        Assert.Equal("12345678X", (string?)data["numero"]);
        // the island claims its own actions
        Assert.Contains(island["actions"]!.AsArray(), a => (string?)a!["id"] == "editar");
        var app = island["children"]![0]!["metadata"]!;
        Assert.Equal("MEDIATOR", (string?)app["variant"]);
        Assert.Equal("/documento?_embeddedMediator=1&_inline=1", (string?)app["homeRoute"]);
        Assert.Equal("/documento", (string?)app["homeConsumedRoute"]);
        Assert.Equal(typeof(DocumentoView).FullName, (string?)app["homeServerSideType"]);

        // without [Inline] the island keeps its label and gets only the embedded marker
        var plain = Node(Handler().Handle(new RunActionRqDto { Route = "estancia-plain" }));
        var plainIsland = Objects(plain).Single(o => (string?)o["type"] == "CustomField")["content"]!;
        Assert.Equal("/documento?_embeddedMediator=1", (string?)plainIsland["route"]);
        Assert.Null(plainIsland["initialData"]!["_inline"]);
    }

    [Fact]
    public void An_inline_island_loads_without_page_chrome_and_keeps_its_markers()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "/documento?_embeddedMediator=1&_inline=1",
            ConsumedRoute = "/documento",
            InitiatorComponentId = "documento",
            ComponentState = new()
            {
                ["_embeddedMediator"] = JsonSerializer.SerializeToElement(true),
                ["_inline"] = JsonSerializer.SerializeToElement(true),
                ["stayId"] = JsonSerializer.SerializeToElement(7),
            },
        });
        Assert.Empty(inc.Commands); // an island never retitles the browser window
        var root = Node(inc);
        var component = root["fragments"]![0]!["component"]!;
        Assert.Equal(typeof(DocumentoView).FullName, (string?)component["serverSideType"]);
        Assert.Equal(7, (int)component["initialData"]!["stayId"]!);
        Assert.True((bool)component["initialData"]!["_inline"]!);
        var page = Objects(component).Single(o => o["metadata"]?["type"]?.GetValue<string>() == "Page")["metadata"]!;
        Assert.Equal(1, (int)page["level"]!);
        Assert.Empty(page["kpis"]!.AsArray());
        // a single-section form drops its card
        Assert.DoesNotContain(Objects(component), o => (string?)o["cssClasses"] == "mateu-section");

        // the same view routed on its own keeps its chrome
        var standalone = Node(Handler().Handle(new RunActionRqDto { Route = "documento" }));
        Assert.Contains(Objects(standalone), o => (string?)o["cssClasses"] == "mateu-section");
    }

    [Fact]
    public void An_island_action_returning_the_next_state_view_re_renders_the_island_in_place()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "documento", ActionId = "editar", ServerSideType = typeof(DocumentoView).FullName,
            InitiatorComponentId = "documento",
            ComponentState = new()
            {
                ["_embeddedMediator"] = JsonSerializer.SerializeToElement(true),
                ["_inline"] = JsonSerializer.SerializeToElement(true),
                ["stayId"] = JsonSerializer.SerializeToElement(7),
                ["numero"] = JsonSerializer.SerializeToElement("X-1"),
            },
        });
        Assert.Empty(inc.Commands);
        var fragment = Assert.Single(inc.Fragments);
        Assert.Equal("documento", fragment.TargetComponentId);
        var component = Node(fragment)["component"]!;
        Assert.Equal(typeof(DocumentoEditor).FullName, (string?)component["serverSideType"]);
        Assert.Equal("X-1", (string?)component["initialData"]!["numero"]);
        Assert.True((bool)component["initialData"]!["_inline"]!);

        var saved = Handler().Handle(new RunActionRqDto
        {
            Route = "documento-editor", ActionId = "guardar", ServerSideType = typeof(DocumentoEditor).FullName,
            ComponentState = new()
            {
                ["stayId"] = JsonSerializer.SerializeToElement(7),
                ["numero"] = JsonSerializer.SerializeToElement("X-1"),
            },
        });
        Assert.Equal("Guardado X-1 (estancia 7)", Assert.Single(saved.Messages).Text);
    }
}
