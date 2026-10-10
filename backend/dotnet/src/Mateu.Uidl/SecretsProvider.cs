namespace Mateu.Uidl;

/// <summary>Resolves the <c>${secret.KEY}</c> placeholders of PROXIED REST sources — the only channel
/// that injects secrets, so an API key never travels to the browser. Register one as a service (or
/// pass <c>o.Secrets</c> to <c>AddMateu</c>); without it a secret falls back to the environment
/// variable <c>MATEU_SECRET_&lt;KEY&gt;</c> — never to an arbitrary variable of the process.
/// (C# analogue of Java's SecretsProvider.)</summary>
public interface ISecretsProvider
{
    /// <summary>The secret's value, or null when unknown.</summary>
    string? Secret(string key);
}
