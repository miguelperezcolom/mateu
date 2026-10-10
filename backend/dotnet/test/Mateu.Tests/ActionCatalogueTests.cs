using System.Collections.Concurrent;
using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;
using Xunit;

namespace Mateu.Tests;

/// <summary>Contributes actions only inside a test flow that switched it on (an AsyncLocal), so the
/// type — discovered by every handler that scans this assembly — leaks nothing elsewhere.</summary>
public class TestActionSupplier : IActionCatalogSupplier
{
    public static readonly AsyncLocal<bool> Enabled = new();

    public IReadOnlyList<CatalogAction> ActionCatalog() => Enabled.Value
        ?
        [
            new CatalogAction("newOrder") { Steps = [new Navigate("elsewhere")] },
            new CatalogAction("supplied") { Steps = [new Navigate("home")] },
            new CatalogAction("notRunnable"),
        ]
        : [];
}

/// <summary>A tree page whose buttons name catalogue ids; it handles <c>refresh</c> itself.</summary>
[UI("catalogue-page")]
public class CataloguePage : IComponentTreeSupplier
{
    public IComponent Component() => new VerticalLayout
    {
        Content =
        [
            new Button("New", "newOrder"),
            new Button("Refresh", "refresh"),
            new Button("Chained", "chained"),
        ],
    };

    public void Refresh() { }
}

/// <summary>The shared ACTION catalogue (mirrors Java's ActionCatalogueSyncTest): actions.yaml plus any
/// <c>type: Actions</c> file, over <see cref="IActionCatalogSupplier"/> implementers — owner first.</summary>
public class ActionCatalogueTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly string Dir = Path.Combine(AppContext.BaseDirectory, "catalogue-specs");

    private static SyncHandler Handler(ActionCatalog catalog) =>
        new(new MateuRegistry(typeof(CataloguePage).Assembly), actionCatalog: new ActionRegistry(catalog));

    [Fact]
    public void The_catalogue_reads_actions_yaml_and_every_type_Actions_file()
    {
        var catalog = ActionRegistry.AuthoredFrom(Dir);
        Assert.Equal(["newOrder", "refreshCustomers", "refresh", "chained", "fromOtherFile"],
            catalog.Actions.Select(a => a.Id));
        Assert.Equal("Start a new order", catalog.Get("newOrder")!.Description);
        Assert.Equal("https://example.test/api/customers", catalog.Get("refreshCustomers")!.RestAction!.Source.Url);
    }

    [Fact]
    public void A_non_client_runnable_entry_is_dropped_with_a_warning()
    {
        var capture = new CapturingLoggerFactory();
        MateuLogging.UseLoggerFactory(capture);
        try
        {
            Assert.Null(ActionRegistry.AuthoredFrom(Dir).Get("serverOnly"));
        }
        finally
        {
            MateuLogging.UseLoggerFactory(null);
        }
        Assert.Contains(capture.Entries, e => e.Level == LogLevel.Warning
                                              && e.Message.Contains("serverOnly")
                                              && e.Message.Contains("not client-runnable"));
    }

    [Fact]
    public void An_authored_entry_replaces_a_supplied_one()
    {
        TestActionSupplier.Enabled.Value = true;
        try
        {
            var catalog = new ActionRegistry(new MateuRegistry(typeof(TestActionSupplier).Assembly), Dir).Catalog;
            Assert.NotNull(catalog.Get("supplied"));
            Assert.Null(catalog.Get("notRunnable"));
            Assert.Equal("orders/new", ((Navigate)catalog.Get("newOrder")!.Steps[1]).Route);
        }
        finally
        {
            TestActionSupplier.Enabled.Value = false;
        }
    }

    [Fact]
    public void The_app_carries_the_catalogue_lowered_to_commands()
    {
        var json = JsonSerializer.Serialize(Handler(ActionRegistry.AuthoredFrom(Dir)).Handle(new RunActionRqDto
        {
            ServerSideType = typeof(Wire.ContextApp).FullName,
        }), Json);
        Assert.Contains("\"actionCatalogue\":[{\"id\":\"newOrder\"", json);
        Assert.Contains("\"commands\":[{\"targetComponentId\":null,\"type\":\"MarkAsClean\",\"data\":null},"
                        + "{\"targetComponentId\":null,\"type\":\"NavigateTo\",\"data\":\"orders/new\"}]", json);
        Assert.Contains("\"url\":\"https://example.test/api/customers\"", json);

        var bare = JsonSerializer.Serialize(Handler(ActionCatalog.Empty).Handle(new RunActionRqDto
        {
            ServerSideType = typeof(Wire.ContextApp).FullName,
        }), Json);
        Assert.Contains("\"actionCatalogue\":[]", bare);
    }

    [Fact]
    public void A_page_resolves_catalogue_ids_after_its_own_methods()
    {
        var increment = Handler(ActionRegistry.AuthoredFrom(Dir)).Handle(new RunActionRqDto { Route = "catalogue-page" });
        var page = increment.Fragments.Select(f => f.Component).OfType<ServerSideComponentDto>().First();
        var ids = page.Actions.Select(a => a.Id).ToList();
        // the catalogue entry the button names travels lowered, plus the one its flow runs (once)
        var newOrder = page.Actions.Single(a => a.Id == "newOrder");
        Assert.Equal(["MarkAsClean", "NavigateTo"], newOrder.Commands!.Select(c => c.Type));
        Assert.Single(ids, "chained");
        Assert.Single(ids, "newOrder");
        // OWNER FIRST: the view's own Refresh method wins over the catalogue's refresh
        Assert.Null(page.Actions.Single(a => a.Id == "refresh").Commands);
        Assert.DoesNotContain("fromOtherFile", ids);
    }

    private sealed class CapturingLoggerFactory : ILoggerFactory
    {
        public readonly ConcurrentQueue<(LogLevel Level, string Message)> Entries = new();
        public ILogger CreateLogger(string categoryName) => new Logger(this);
        public void AddProvider(ILoggerProvider provider) { }
        public void Dispose() { }

        private sealed class Logger(CapturingLoggerFactory owner) : ILogger
        {
            public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
            public bool IsEnabled(LogLevel logLevel) => true;
            public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception,
                Func<TState, Exception?, string> formatter) => owner.Entries.Enqueue((logLevel, formatter(state, exception)));
        }
    }
}
