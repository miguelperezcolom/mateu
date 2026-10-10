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

    internal static ILogger For(string category) => _factory.CreateLogger(category);
}

/// <summary>The error boundary of the sync endpoint: turns an exception escaping an action into the
/// error-message increment the renderers show, instead of a raw HTTP 500 they cannot render.
///
/// <para>The rule (the Java core's "an application exception shows its message"): a
/// <see cref="UserFacingException"/> — thrown on purpose, for the user — shows its message;
/// anything else is a failure and shows a generic text with a correlation id, so whoever reads the
/// log can find the entry. Details reach the screen only when <c>detailed</c> is set (the host's
/// Development environment).</para></summary>
public static class MateuErrors
{
    /// <summary>The generic text of an unexpected failure.</summary>
    public const string GenericText = "Something went wrong. Please try again; if it keeps happening, quote reference {0}.";

    /// <summary>The exception the user code actually threw: reflection invocation wraps it in a
    /// <see cref="TargetInvocationException"/>, and that wrapper says nothing.</summary>
    public static Exception Unwrap(Exception e)
    {
        while (e is TargetInvocationException { InnerException: { } inner }) e = inner;
        while (e is AggregateException { InnerExceptions.Count: 1 } agg) e = agg.InnerExceptions[0];
        return e;
    }

    /// <summary>The increment answering <paramref name="error"/>.</summary>
    public static UIIncrementDto Increment(Exception error, string correlationId, bool detailed)
    {
        var e = Unwrap(error);
        string title, text;
        if (e is UserFacingException user)
        {
            title = user.Title ?? "Error";
            text = user.Message;
        }
        else if (detailed)
        {
            title = e.GetType().Name;
            text = $"{e.Message} (reference {correlationId})";
        }
        else
        {
            title = "Error";
            text = string.Format(GenericText, correlationId);
        }
        return UIIncrementDto.Of(messages: [new MessageDto("error", "middle", title, text, 10000)]);
    }
}
