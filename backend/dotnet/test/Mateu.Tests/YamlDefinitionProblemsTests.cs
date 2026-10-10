using System.Collections.Concurrent;
using Mateu.Core;
using Microsoft.Extensions.Logging;
using Xunit;

namespace Mateu.Tests;

/// <summary>A routes.yaml entry naming a layout file that does not exist used to answer "not found"
/// with nothing in the log. The loader now names the route, the layout and what to do — the mirror
/// of Java's YamlSpecProblemsTest and Python's test_yaml_definition_problems.</summary>
public class YamlDefinitionProblemsTests
{
    [Fact]
    public void A_layout_file_that_does_not_exist_is_named()
    {
        var dir = Directory.CreateTempSubdirectory("mateu-missing-layout").FullName;
        File.WriteAllText(Path.Combine(dir, "app.ui.yaml"), "type: UI\nbasePath: /\nroutes:\n  - routes.yaml\n");
        File.WriteAllText(Path.Combine(dir, "routes.yaml"), "routes:\n  - route: form\n    layout: from.yaml\n");
        File.WriteAllText(Path.Combine(dir, "form.yaml"), "type: VerticalLayout\ncontent: []\n");
        var capture = new CapturingLoggerFactory();
        MateuLogging.UseLoggerFactory(capture);
        try
        {
            Assert.Null(new YamlSpecLoader(dir, new RouteRegistry(dir)).LoadSpec("form"));
        }
        finally
        {
            MateuLogging.UseLoggerFactory(null);
        }
        Assert.Contains(capture.Entries, e => e.Level == LogLevel.Warning
                                              && e.Message.Contains("route \"form\" names layout \"from.yaml\"")
                                              && e.Message.Contains("does not exist"));
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
