using System.Net;
using Mateu.AspNetCore;
using Mateu.Core;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

/// <summary>Development mode (live reload): the registries forget what they read when a spec changes,
/// the watcher reports edits on disk, and the dev endpoints exist only with dev mode on.</summary>
[Collection("DevMode")]
public class LiveReloadTests : IDisposable
{
    private readonly string _dir = Directory.CreateTempSubdirectory("mateu-live-").FullName;

    public void Dispose()
    {
        DevSpecs.Enable(false);
        Directory.Delete(_dir, recursive: true);
    }

    private string Write(string name, string content)
    {
        var path = Path.Combine(_dir, name);
        File.WriteAllText(path, content);
        return path;
    }

    [Fact]
    public void An_edited_route_table_is_read_again_after_a_change()
    {
        Write("routes.yaml", "routes:\n  - route: live\n    definition: live.yaml\n");
        var registry = new RouteRegistry(_dir);
        Assert.NotNull(registry.Match("live"));
        Assert.Null(registry.Match("added"));

        var file = Write("routes.yaml", "routes:\n  - route: live\n    definition: live.yaml\n  - route: added\n    definition: added.yaml\n");
        DevSpecs.Changed([file]);

        Assert.NotNull(registry.Match("added"));
    }

    [Fact]
    public void An_edited_definition_and_source_catalogue_are_read_again()
    {
        Write("live.yaml", "layout:\n  type: Text\n  text: one\n");
        Write("sources.yaml", "sources:\n  - name: live\n    source:\n      url: https://one.example\n");
        var loader = new YamlSpecLoader(_dir);
        var sources = new RestSourceRegistry(new MateuRegistry(typeof(LiveReloadTests).Assembly), _dir);
        Assert.NotNull(loader.LoadSpec("live")?.Layout);
        Assert.Equal("https://one.example", sources.Catalog.Get("live")?.Source.Url);

        Write("live.yaml", "layout:\n  type: Text\n  text: two\n");
        var file = Write("sources.yaml", "sources:\n  - name: live\n    source:\n      url: https://two.example\n");
        DevSpecs.Changed([file]);

        Assert.Equal("https://two.example", sources.Catalog.Get("live")?.Source.Url);
        Assert.Contains("two", System.Text.Json.JsonSerializer.Serialize<object>(loader.LoadSpec("live")!.Layout!));
    }

    [Fact]
    public void A_route_file_is_an_app_level_change_and_a_page_is_not()
    {
        var events = new List<string>();
        using var _ = DevSpecs.Subscribe(events.Add);
        DevSpecs.Changed([Write("routes.yaml", "routes: []\n")]);
        DevSpecs.Changed([Write("page.yaml", "layout:\n  type: Text\n")]);
        DevSpecs.Reload();
        Assert.Contains("\"scope\":\"app\"", events[0]);
        Assert.Contains("\"type\":\"specs-changed\"", events[1]);
        Assert.Contains("\"scope\":\"page\"", events[1]);
        Assert.Contains("\"type\":\"reload\"", events[2]);
    }

    [Fact]
    public async Task The_watcher_reports_an_edit_on_disk()
    {
        var events = new List<string>();
        using var _ = DevSpecs.Subscribe(json => { lock (events) events.Add(json); });
        DevSpecs.Enable(true, _dir);
        Write("watched.yaml", "layout:\n  type: Text\n");
        for (var i = 0; i < 100 && !Has(events, "watched.yaml"); i++) await Task.Delay(100);
        Assert.True(Has(events, "watched.yaml"));
    }

    private static bool Has(List<string> events, string text)
    {
        lock (events) return events.Any(e => e.Contains(text));
    }

    [Fact]
    public async Task The_dev_endpoints_exist_only_in_dev_mode()
    {
        DevSpecs.Enable(false);
        await using (var off = await Start())
        {
            using var http = new HttpClient { BaseAddress = new Uri(Address(off)) };
            Assert.Equal(HttpStatusCode.NotFound, (await http.GetAsync(DevSpecs.EventsPath)).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await http.PostAsync(DevSpecs.ReloadPath, null)).StatusCode);
        }

        DevSpecs.Enable(true, _dir);
        await using var on = await Start();
        using var client = new HttpClient { BaseAddress = new Uri(Address(on)), Timeout = TimeSpan.FromSeconds(20) };
        using var response = await client.GetAsync(DevSpecs.EventsPath, HttpCompletionOption.ResponseHeadersRead);
        Assert.Equal("text/event-stream", response.Content.Headers.ContentType?.MediaType);
        using var reader = new StreamReader(await response.Content.ReadAsStreamAsync());
        var hello = await reader.ReadLineAsync();
        Assert.Contains("\"type\":\"hello\"", hello);
        Assert.Contains(DevSpecs.BootId, hello);

        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsync(DevSpecs.ReloadPath, null)).StatusCode);
        string? line;
        do line = await reader.ReadLineAsync(); while (line != null && !line.StartsWith("data:") || line!.Contains("ping"));
        Assert.Contains("\"type\":\"reload\"", line);
    }

    private static async Task<WebApplication> Start()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Services.AddMateu(typeof(LiveReloadTests).Assembly);
        var app = builder.Build();
        app.MapMateu();
        await app.StartAsync();
        return app;
    }

    private static string Address(WebApplication app) =>
        app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
}
