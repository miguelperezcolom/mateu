namespace Mateu.Uidl;

/// <summary>One phone's push address, as the Mateu app registered it with the reserved
/// <c>_push-register</c> action: the push service's token (an Expo push token), the platform
/// (<c>ios</c> | <c>android</c>), a device id the app drew once per install (a new token of the same
/// device replaces the old one) and the base url the phone knows this UI by — a push carries it back
/// so a tap opens THIS UI. (C# analogue of Java's io.mateu.uidl.push.PushToken.) EXPERIMENTAL.</summary>
public sealed record PushToken(string Token, string? Platform = null, string? DeviceId = null, string? Ui = null);

/// <summary>What a push says: a title, an optional text, the route a tap opens and an optional id
/// that collapses repeats (the inbox entry id). Data is extra key/value data for the app; Mateu adds
/// <c>ui</c> and <c>route</c> itself. (Java's io.mateu.uidl.push.PushMessage.) EXPERIMENTAL.</summary>
public sealed record PushMessage(string? Title, string? Text = null, string? Route = null, string? Id = null)
{
    public IReadOnlyDictionary<string, string> Data { get; init; } = new Dictionary<string, string>();

    /// <summary>The push an inbox entry becomes: its title and text, its route (or its first
    /// action's).</summary>
    public static PushMessage Of(AppNotification entry) => new(entry.Title, entry.Text,
        !string.IsNullOrWhiteSpace(entry.Route)
            ? entry.Route
            : entry.Actions.Select(a => a.Route).FirstOrDefault(r => !string.IsNullOrWhiteSpace(r)),
        entry.Id);
}

/// <summary>What an <see cref="IPushSender"/> reports: how many pushes the service accepted and the
/// tokens it said are no longer valid — Mateu unregisters those. EXPERIMENTAL.</summary>
public sealed record PushResult(int Accepted, IReadOnlyList<string> UnregisteredTokens)
{
    public static PushResult None { get; } = new(0, []);
}

/// <summary>Where the phones' push tokens are kept (remote push, [App(OsNotifications = true)]).
/// Mateu ships UI only: register an IPushTokenStore service to keep them; Mateu's default is in
/// memory, per process, bounded and LOST ON RESTART (a warning the first time it is used). The
/// principal is the identity the host authenticated; an anonymous caller's token is kept under
/// <c>session:&lt;X-Session-Id&gt;</c>. (Java's io.mateu.uidl.interfaces.PushTokenStore.)
/// EXPERIMENTAL.</summary>
public interface IPushTokenStore
{
    /// <summary>Keeps the token for the principal; the same token, or another token of the same
    /// device, replaces the previous entry, whoever it belonged to.</summary>
    void Register(string principal, PushToken token);

    /// <summary>Forgets this token, whoever it was registered for.</summary>
    void Unregister(string token);

    /// <summary>The tokens of the principal's phones.</summary>
    IReadOnlyList<PushToken> TokensFor(string principal);
}

/// <summary>Sends a push to phones. Mateu ships UI only: register an IPushSender service, or turn on
/// Mateu's Expo sender (<c>MateuOptions.ExpoPush</c> / <c>MATEU_PUSH_EXPO_ENABLED=true</c>). Each push
/// carries, as data, <c>ui</c> = the token's Ui and <c>route</c> = the message's route.
/// (Java's io.mateu.uidl.interfaces.PushSender.) EXPERIMENTAL.</summary>
public interface IPushSender
{
    /// <summary>Sends the message to the tokens; reports the tokens the service no longer knows.</summary>
    Task<PushResult> SendAsync(PushMessage message, IReadOnlyList<PushToken> tokens, CancellationToken cancellationToken = default);
}

/// <summary>Sends a push notification to a user's phones — it reaches the phone while the Mateu app
/// is suspended or closed. Mateu already sends one for every inbox message it stores for a signed-in
/// caller; call this for what your own code puts in the inbox, or for anything else. Nothing is sent
/// unless the app has a sender and the phone registered. Off the calling thread; never throws.
/// (Java's io.mateu.uidl.PushNotifications.) EXPERIMENTAL.</summary>
public static class PushNotifications
{
    private static readonly List<Action<string, PushMessage>> Listeners = [];
    private static readonly object Lock = new();

    /// <summary>Sends the message to the phones the principal registered.</summary>
    public static void Send(string principal, PushMessage message)
    {
        if (string.IsNullOrWhiteSpace(principal)) return;
        Action<string, PushMessage>[] listeners;
        lock (Lock) listeners = Listeners.ToArray();
        foreach (var listener in listeners)
        {
            try { listener(principal, message); }
            catch { /* a broken delivery must not fail the caller */ }
        }
    }

    /// <summary>Sends an inbox entry as a push.</summary>
    public static void Send(string principal, AppNotification entry) => Send(principal, PushMessage.Of(entry));

    /// <summary>Sends the message to the phone of an ANONYMOUS session (its X-Session-Id).</summary>
    public static void SendToSession(string sessionId, PushMessage message)
    {
        if (!string.IsNullOrWhiteSpace(sessionId)) Send(SessionKey(sessionId), message);
    }

    /// <summary>The store key of an anonymous session's tokens.</summary>
    public static string SessionKey(string sessionId) => "session:" + sessionId;

    /// <summary>The framework's delivery listens here (until disposed); an app does not need it.</summary>
    public static IDisposable Subscribe(Action<string, PushMessage> deliver)
    {
        lock (Lock) Listeners.Add(deliver);
        return new Unsubscriber(deliver);
    }

    private sealed class Unsubscriber(Action<string, PushMessage> listener) : IDisposable
    {
        public void Dispose()
        {
            lock (Lock) Listeners.Remove(listener);
        }
    }
}
