using System.Text;
using System.Text.Json;
using Mateu.AspNetCore;
using Mateu.Core;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

// How the long-lived streams of POST /mateu/v3/sse end: a refused agent channel answers its single
// error increment, and a browser that goes away closes the live-updates and agent-channel streams
// (their subscriptions die with them).
public class SseStreamEndsTests
{
    private static async Task<(WebApplication app, HttpClient http)> Start(bool push)
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Environment.EnvironmentName = "Production";
        builder.Services.AddMateu(o =>
        {
            o.Mcp = push;
            o.McpPush = push;
        }, typeof(SseStreamEndsTests).Assembly);
        var app = builder.Build();
        app.MapMateu();
        await app.StartAsync();
        var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
        return (app, new HttpClient { BaseAddress = new Uri(address), Timeout = TimeSpan.FromSeconds(20) });
    }

    private static HttpRequestMessage Sse(string route, object body) => new(HttpMethod.Post, "/mateu/v3/sse/" + route)
    {
        Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json"),
    };

    private static object AgentChannel(string session) => new
    {
        actionId = SyncHandler.AgentChannelAction, route = "",
        parameters = new { sessionId = session, secret = session + "-secret", route = "/", renderer = "vaadin" },
    };

    private static async Task<string> FirstData(HttpResponseMessage response, CancellationToken token)
    {
        var reader = new StreamReader(await response.Content.ReadAsStreamAsync(token));
        string? line;
        do line = await reader.ReadLineAsync(token); while (line is not null && !line.StartsWith("data:"));
        return line ?? "";
    }

    [Fact]
    public async Task An_agent_channel_with_push_off_answers_its_refusal_and_ends()
    {
        var (app, http) = await Start(push: false);
        await using var _ = app;
        using var __ = http;
        var body = await (await http.SendAsync(Sse("", AgentChannel("tab-off")))).Content.ReadAsStringAsync();
        var events = body.Split("\n\n", StringSplitOptions.RemoveEmptyEntries);
        Assert.Single(events);
        Assert.StartsWith("data: ", events[0]);
        Assert.Contains("\"messages\"", events[0]);
        await app.StopAsync();
    }

    [Fact]
    public async Task A_browser_that_goes_away_closes_the_live_updates_and_agent_channel_streams()
    {
        var (app, http) = await Start(push: true);
        await using var _ = app;
        using var __ = http;
        var streams = new[]
        {
            Sse("notification-desk", new { serverSideType = typeof(NotificationDesk).FullName, route = "/notification-desk", actionId = "_live-updates" }),
            Sse("", AgentChannel("tab-gone")),
        };
        foreach (var request in streams)
        {
            using var abort = new CancellationTokenSource();
            var response = await http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, abort.Token);
            Assert.StartsWith("data:", await FirstData(response, abort.Token));
            abort.Cancel();
            response.Dispose();
        }
        // the server notices and ends both streams; stopping does not wait for a 5-minute stream
        var stopped = app.StopAsync();
        Assert.Same(stopped, await Task.WhenAny(stopped, Task.Delay(TimeSpan.FromSeconds(15))));
    }
}
