namespace Mateu.Uidl;

/// <summary>An application exception whose message is MEANT for the user ("The booking is already
/// checked in", "Not enough stock"). Thrown from an action, its message reaches the screen as an
/// error toast, with <see cref="Title"/> as the toast title.
///
/// <para>Every other exception is treated as a FAILURE, not a message: the user sees a generic
/// "Something went wrong" with a correlation id, the details go to the server log only (and to the
/// screen in Development). A stack trace, a SQL statement or an internal host name in a toast is an
/// information leak; a business rule that cannot be stated to the user is a bad business rule.</para>
/// </summary>
public class UserFacingException(string message, string? title = null, Exception? inner = null)
    : Exception(message, inner)
{
    /// <summary>The toast title (null → "Error").</summary>
    public string? Title { get; } = title;
}

/// <summary>Resolves the <c>${secret.KEY}</c> placeholders of PROXIED REST sources — the only channel
/// that injects secrets, so an API key never travels to the browser. Register one as a service (or
/// pass <c>o.Secrets</c> to <c>AddMateu</c>); without it a secret falls back to the same-named
/// environment variable. (C# analogue of Java's SecretsProvider.)</summary>
public interface ISecretsProvider
{
    /// <summary>The secret's value, or null when unknown.</summary>
    string? Secret(string key);
}
