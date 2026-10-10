using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace Mateu.Core;

/// <summary>Where Mateu.Core logs. The core has no host of its own, so the adapter hands it the
/// application's <see cref="ILoggerFactory"/> (AddMateu does); until then nothing is logged.</summary>
public static class MateuLogging
{
    private static ILoggerFactory _factory = NullLoggerFactory.Instance;

    /// <summary>Route Mateu.Core's diagnostics to the application's logging.</summary>
    public static void UseLoggerFactory(ILoggerFactory? factory) =>
        _factory = factory ?? NullLoggerFactory.Instance;

    internal static ILogger For(string category)
    {
        try
        {
            return _factory.CreateLogger(category);
        }
        catch (ObjectDisposedException)
        {
            // The host that handed us its factory has shut down (a disposed test host, an app
            // stopping): fall back to silence rather than failing the request that wanted to log.
            _factory = NullLoggerFactory.Instance;
            return NullLogger.Instance;
        }
    }
}

/// <summary>The error boundary of the sync endpoint: turns an exception escaping an action into the
/// error-message increment the renderers show, instead of a raw HTTP 500 they cannot render. The
/// texts and rules are <see cref="ErrorBoundary"/>'s (shared with Java and Python); this adds the
/// increment and the correlation id the adapter logs the entry under.</summary>
public static class MateuErrors
{
    /// <summary>The exception the user code actually threw: reflection invocation wraps it in a
    /// <see cref="TargetInvocationException"/>, and that wrapper says nothing.</summary>
    public static Exception Unwrap(Exception e)
    {
        while (e is TargetInvocationException { InnerException: { } inner }) e = inner;
        while (e is AggregateException { InnerExceptions.Count: 1 } agg) e = agg.InnerExceptions[0];
        return e;
    }

    /// <summary>Whether the error is a message meant for the user (logged at information, not error).</summary>
    public static bool IsForTheUser(Exception error) =>
        ErrorBoundary.Describe(error, detailed: false, reference: "-").Reference is null;

    /// <summary>The increment answering <paramref name="error"/>.</summary>
    public static UIIncrementDto Increment(Exception error, string correlationId, bool detailed) =>
        UIIncrementDto.Of(messages: [ErrorBoundary.Describe(Unwrap(error), detailed, correlationId).Message]);
}
