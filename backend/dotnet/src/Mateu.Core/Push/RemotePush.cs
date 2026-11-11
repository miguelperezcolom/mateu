using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;

namespace Mateu.Core.Push;

/// <summary>Mateu's default <see cref="IPushTokenStore"/>: in memory, per process, bounded —
/// <see cref="MaxPerPrincipal"/> tokens per principal (newest kept), <see cref="MaxPrincipals"/>
/// principals (least recently registered dropped first). LOST ON RESTART. (Mirrors Java's
/// InMemoryPushTokenStore.) EXPERIMENTAL.</summary>
public sealed class InMemoryPushTokenStore : IPushTokenStore
{
    public const int MaxPerPrincipal = 10;
    public const int MaxPrincipals = 10_000;

    private readonly object _lock = new();
    private readonly Dictionary<string, List<PushToken>> _tokens = new();
    private readonly LinkedList<string> _recency = new();

    public void Register(string principal, PushToken token)
    {
        lock (_lock)
        {
            RemoveWhere(t => t.Token == token.Token
                             || (t.DeviceId is not null && t.DeviceId == token.DeviceId && t.Ui == token.Ui));
            if (!_tokens.TryGetValue(principal, out var list)) _tokens[principal] = list = [];
            _recency.Remove(principal);
            _recency.AddLast(principal);
            list.Add(token);
            if (list.Count > MaxPerPrincipal) list.RemoveRange(0, list.Count - MaxPerPrincipal);
            while (_tokens.Count > MaxPrincipals && _recency.First is { } eldest)
            {
                _tokens.Remove(eldest.Value);
                _recency.RemoveFirst();
            }
        }
    }

    public void Unregister(string token)
    {
        lock (_lock) RemoveWhere(t => t.Token == token);
    }

    public IReadOnlyList<PushToken> TokensFor(string principal)
    {
        lock (_lock) return _tokens.TryGetValue(principal, out var list) ? list.ToList() : [];
    }

    private void RemoveWhere(Predicate<PushToken> match)
    {
        foreach (var key in _tokens.Keys.ToList())
        {
            _tokens[key].RemoveAll(match);
            if (_tokens[key].Count == 0)
            {
                _tokens.Remove(key);
                _recency.Remove(key);
            }
        }
    }
}

/// <summary>Mateu's optional <see cref="IPushSender"/> over Expo's push service: on only with
/// <c>MateuOptions.ExpoPush</c> (or <c>MATEU_PUSH_EXPO_ENABLED=true</c>) and when the app registers
/// no IPushSender. Batches of at most 100; <c>MATEU_PUSH_EXPO_ACCESS_TOKEN</c> is sent as the bearer
/// token; a <c>DeviceNotRegistered</c> ticket reports its token gone. Expo's receipts are not polled.
/// (Mirrors Java's ExpoPushSender.) EXPERIMENTAL.</summary>
public sealed class ExpoPushSender(HttpClient http, string? url = null, string? accessToken = null) : IPushSender
{
    public const string DefaultUrl = "https://exp.host/--/api/v2/push/send";
    public const int Batch = 100;
    private const string Channel = "mateu";

    private readonly Uri _url = new(string.IsNullOrWhiteSpace(url) ? DefaultUrl : url);

    public async Task<PushResult> SendAsync(PushMessage message, IReadOnlyList<PushToken> tokens,
        CancellationToken cancellationToken = default)
    {
        var accepted = 0;
        var gone = new List<string>();
        for (var from = 0; from < tokens.Count; from += Batch)
        {
            var batch = tokens.Skip(from).Take(Batch).ToList();
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Post, _url)
                {
                    Content = new StringContent(JsonSerializer.Serialize(batch.Select(t => MessageFor(message, t))),
                        Encoding.UTF8, "application/json"),
                };
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                if (!string.IsNullOrWhiteSpace(accessToken))
                    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                using var response = await http.SendAsync(request, cancellationToken).ConfigureAwait(false);
                if (!response.IsSuccessStatusCode)
                {
                    MateuLogging.For("Mateu.Push").LogWarning($"Expo push answered {(int)response.StatusCode}");
                    continue;
                }
                using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false));
                if (!doc.RootElement.TryGetProperty("data", out var tickets) || tickets.ValueKind != JsonValueKind.Array) continue;
                var i = 0;
                foreach (var ticket in tickets.EnumerateArray())
                {
                    if (i >= batch.Count) break;
                    if (ticket.TryGetProperty("status", out var status) && status.GetString() == "ok") accepted++;
                    else if (ticket.TryGetProperty("details", out var details)
                             && details.TryGetProperty("error", out var error)
                             && error.GetString() == "DeviceNotRegistered")
                        gone.Add(batch[i].Token);
                    i++;
                }
            }
            catch (Exception e) when (e is HttpRequestException or TaskCanceledException or JsonException)
            {
                MateuLogging.For("Mateu.Push").LogWarning($"Expo push: a batch of {batch.Count} could not be sent: {e.Message}");
            }
        }
        return new PushResult(accepted, gone);
    }

    /// <summary>One Expo message: the push's texts, and ui + route for the tap.</summary>
    internal static Dictionary<string, object?> MessageFor(PushMessage message, PushToken token)
    {
        var data = new Dictionary<string, object?>();
        foreach (var (k, v) in message.Data) data[k] = v;
        if (token.Ui is not null) data["ui"] = token.Ui;
        if (!string.IsNullOrWhiteSpace(message.Route)) data["route"] = message.Route;
        if (message.Id is not null) data["id"] = message.Id;
        var result = new Dictionary<string, object?>
        {
            ["to"] = token.Token,
            ["title"] = message.Title ?? "Notification",
        };
        if (!string.IsNullOrWhiteSpace(message.Text)) result["body"] = message.Text;
        result["data"] = data;
        result["sound"] = "default";
        result["channelId"] = Channel;
        return result;
    }
}

/// <summary>The phone side of remote push: the reserved <c>_push-register</c> / <c>_push-unregister</c>
/// actions' parameter checks and the delivery of one push (off the request thread; tokens the sender
/// reports gone are unregistered). (Mirrors Java's PushActionRunner + Push.)</summary>
public static partial class RemotePush
{
    public const string RegisterAction = "_push-register";
    public const string UnregisterAction = "_push-unregister";

    [GeneratedRegex(@"^[\x21-\x7E]{1,4096}$")] private static partial Regex TokenPattern();
    [GeneratedRegex(@"^[A-Za-z0-9._:-]{1,128}$")] private static partial Regex DevicePattern();

    private static int _warned;

    /// <summary>The store to use: the app's, else the default (a warning the first time).</summary>
    internal static IPushTokenStore Store(IPushTokenStore? app, IPushTokenStore fallback)
    {
        if (app is not null) return app;
        if (Interlocked.Exchange(ref _warned, 1) == 0)
            MateuLogging.For("Mateu.Push").LogWarning("Push tokens are kept in memory (no IPushTokenStore service): they are lost on restart"
                              + " and not shared across instances. Register an IPushTokenStore to keep them.");
        return fallback;
    }

    public static bool ValidToken(string? token) => token is not null && TokenPattern().IsMatch(token);

    /// <summary>The registration a request's parameters describe (unusable values dropped).</summary>
    public static PushToken TokenOf(string token, string? platform, string? deviceId, string? ui) => new(
        token,
        platform is "ios" or "android" or "web" ? platform : null,
        deviceId is not null && DevicePattern().IsMatch(deviceId) ? deviceId : null,
        WebUrl(ui));

    /// <summary>An http(s) url, else null.</summary>
    public static string? WebUrl(string? value) =>
        value is { Length: <= 2048 } && Uri.TryCreate(value, UriKind.Absolute, out var uri)
        && (uri.Scheme == Uri.UriSchemeHttps || uri.Scheme == Uri.UriSchemeHttp) && uri.Host.Length > 0
            ? value
            : null;

    /// <summary>Who a registration is for: the principal, else the anonymous session, else null.</summary>
    public static string? OwnerOf(string? principal, string? sessionId) =>
        !string.IsNullOrWhiteSpace(principal) ? principal
        : !string.IsNullOrWhiteSpace(sessionId) && sessionId.Length <= 128 ? PushNotifications.SessionKey(sessionId)
        : null;

    /// <summary>Sends the message to the principal's phones and drops the gone tokens.</summary>
    public static async Task DeliverAsync(string principal, PushMessage message, IPushSender sender, IPushTokenStore store)
    {
        try
        {
            var tokens = store.TokensFor(principal);
            if (tokens.Count == 0) return;
            var result = await sender.SendAsync(message, tokens).ConfigureAwait(false);
            foreach (var gone in result.UnregisteredTokens) store.Unregister(gone);
        }
        catch (Exception e)
        {
            MateuLogging.For("Mateu.Push").LogWarning($"A push could not be sent: {e.Message}");
        }
    }
}
