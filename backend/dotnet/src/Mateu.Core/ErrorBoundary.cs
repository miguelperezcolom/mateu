using System.ComponentModel.DataAnnotations;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>What the user is told when an action fails — the .NET twin of Java's
/// <c>ErrorBoundary</c>, with the same texts: a <see cref="UserFacingException"/> (anywhere in the
/// inner-exception chain) shows its title and message; a <see cref="ValidationException"/> shows its
/// validation message; anything else is a bug — a generic message with a 12-character reference the
/// adapter logs the exception under. <c>MATEU_ERRORS_DETAILED=true</c> restores the raw exception in
/// the toast, for development.</summary>
public static class ErrorBoundary
{
    public const string GenericTitle = "Something went wrong";
    public const string GenericText = "An unexpected error occurred. Reference: ";
    public const string DetailedEnv = "MATEU_ERRORS_DETAILED";

    /// <summary>The toast for <paramref name="error"/>, and the reference to log it under — null
    /// when it is a message meant for the user (nothing to log as an error).</summary>
    public static (MessageDto Message, string? Reference) Describe(Exception error, bool? detailed = null)
    {
        if (Find<UserFacingException>(error) is { } userFacing)
            return (Message(userFacing.Title ?? "Error", userFacing.Message), null);
        if (Find<ValidationException>(error) is { } validation)
            return (Message("Validation error", validation.ValidationResult?.ErrorMessage ?? validation.Message), null);
        var reference = Guid.NewGuid().ToString("N")[..12];
        var showDetails = detailed ?? string.Equals(
            Environment.GetEnvironmentVariable(DetailedEnv), "true", StringComparison.OrdinalIgnoreCase);
        if (showDetails)
        {
            var source = Innermost(error);
            return (Message(source.GetType().Name, source.Message + " (ref " + reference + ")"), reference);
        }
        return (Message(GenericTitle, GenericText + reference), reference);
    }

    private static MessageDto Message(string title, string text) => new("error", "middle", title, text, 0);

    private static T? Find<T>(Exception? error) where T : Exception
    {
        for (var e = error; e is not null; e = e.InnerException)
        {
            if (e is T match) return match;
            if (e is AggregateException aggregate)
                foreach (var inner in aggregate.InnerExceptions)
                    if (Find<T>(inner) is { } found) return found;
        }
        return null;
    }

    private static Exception Innermost(Exception error)
    {
        var e = error;
        while (e.InnerException is not null) e = e.InnerException;
        return e;
    }
}
