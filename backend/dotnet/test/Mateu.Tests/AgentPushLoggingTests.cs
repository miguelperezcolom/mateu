using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Core.AgentPush;
using Mateu.Core.Mcp;
using Mateu.Dtos;
using Xunit;

namespace Mateu.Tests;

/// <summary>NM4: a session handle is a bearer capability (an anonymously paired session is reached by
/// whoever holds it), so it never goes to a log — only its fingerprint (<c>s-</c> + 12 hex digits of
/// its SHA-256, the same in Java and Python).</summary>
[Collection(ProcessWideStateCollection.Name)]
public class AgentPushLoggingTests
{
    static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    static RunActionRqDto Rq(string action, string sessionId, string secret, params (string Key, string Value)[] extra)
    {
        var parameters = new Dictionary<string, object?> { ["sessionId"] = sessionId, ["secret"] = secret };
        foreach (var (k, v) in extra) parameters[k] = v;
        return new RunActionRqDto { ActionId = action, Route = "", Parameters = parameters };
    }

    static JsonNode Tool(McpService svc, string name, JsonObject arguments)
    {
        var r = McpJsonRpc.Handle(new JsonObject
        {
            ["jsonrpc"] = "2.0", ["id"] = 1, ["method"] = "tools/call",
            ["params"] = new JsonObject { ["name"] = name, ["arguments"] = arguments },
        }, svc, false, null);
        var result = r!["result"]!;
        Assert.False(result["isError"]?.GetValue<bool>() == true, (string)result["content"]![0]!["text"]!);
        return JsonNode.Parse((string)result["content"]![0]!["text"]!)!;
    }

    [Fact]
    public void The_log_never_carries_a_session_handle_only_its_fingerprint()
    {
        var sessions = new AgentSessions(30, 1000, 20, () => DateTimeOffset.UtcNow);
        var handler = new SyncHandler(new MateuRegistry(typeof(AgentPushLoggingTests).Assembly))
        {
            AgentPush = sessions, Principal = () => null, ClientAddress = () => "10.0.0.1",
        };
        handler.OpenAgentChannel(Rq(SyncHandler.AgentChannelAction, "ui-1", "secret-1", ("route", "/"), ("renderer", "vaadin")));
        var increment = handler.Handle(Rq(SyncHandler.AgentPairAction, "ui-1", "secret-1"));
        var pairing = (Dictionary<string, object?>)((Dictionary<string, object?>)increment.Fragments[0].Data!)[SyncHandler.AgentPairingKey]!;
        var mcp = new McpService(handler, Json) { Push = sessions, Caller = AgentCaller.Anonymous };

        var capture = new Capture();
        MateuLogging.UseLoggerFactory(capture);
        string handle;
        try
        {
            handle = (string)Tool(mcp, "mateu_pair_session", new() { ["code"] = (string)pairing["code"]! })["session"]!;
            Tool(mcp, "mateu_push_ui", new() { ["session"] = handle, ["yaml"] = "type: Text\ntext: Hi\n" });
        }
        finally
        {
            MateuLogging.UseLoggerFactory(null);
        }
        var lines = capture.Entries.Select(e => e.Message).Where(m => m.Contains("agent push")).ToList();
        Assert.Equal(2, lines.Count);
        Assert.All(lines, l => Assert.DoesNotContain(handle, l));
        Assert.All(lines, l => Assert.Contains(AgentSessions.Fingerprint(handle), l));
        Assert.StartsWith("s-", AgentSessions.Fingerprint(handle));
        Assert.Equal(14, AgentSessions.Fingerprint(handle).Length);
        // the same digest as Java and Python: "s-" + sha256("abc")[..12]
        Assert.Equal("s-ba7816bf8f01", AgentSessions.Fingerprint("abc"));
    }

    sealed class Capture : Microsoft.Extensions.Logging.ILoggerFactory
    {
        public readonly System.Collections.Concurrent.ConcurrentQueue<(Microsoft.Extensions.Logging.LogLevel Level, string Message)> Entries = new();
        public Microsoft.Extensions.Logging.ILogger CreateLogger(string categoryName) => new Logger(this);
        public void AddProvider(Microsoft.Extensions.Logging.ILoggerProvider provider) { }
        public void Dispose() { }

        sealed class Logger(Capture owner) : Microsoft.Extensions.Logging.ILogger
        {
            public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
            public bool IsEnabled(Microsoft.Extensions.Logging.LogLevel logLevel) => true;
            public void Log<TState>(Microsoft.Extensions.Logging.LogLevel logLevel, Microsoft.Extensions.Logging.EventId eventId,
                TState state, Exception? exception, Func<TState, Exception?, string> formatter) =>
                owner.Entries.Enqueue((logLevel, formatter(state, exception)));
        }
    }
}
