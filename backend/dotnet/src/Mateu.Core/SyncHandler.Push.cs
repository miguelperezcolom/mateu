using Mateu.Core.Push;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Remote push ([App(OsNotifications = true)] beyond an app in front): the phone registers its push
// token; an inbox message (or PushNotifications.Send) reaches the app's IPushSender with the
// caller's tokens. Mirrors Java's PushActionRunner + Push.
internal sealed partial class SyncHandler
{
    private static readonly InMemoryPushTokenStore DefaultPushTokens = new();

    /// <summary>The app's IPushTokenStore service; null = Mateu's in-memory default.</summary>
    public IPushTokenStore? PushTokenStore { get; init; }

    /// <summary>What sends pushes (the app's IPushSender, else Mateu's Expo sender when switched on);
    /// null = push is off: the app metadata says so and registrations are not kept.</summary>
    public IPushSender? PushSender { get; init; }

    internal IPushTokenStore PushTokens => RemotePush.Store(PushTokenStore, DefaultPushTokens);

    private static bool IsPushAction(string? actionId) =>
        actionId is RemotePush.RegisterAction or RemotePush.UnregisterAction;

    /// <summary><c>_push-register {token, platform, deviceId, ui}</c> → keeps the token for the
    /// caller (the principal, else the anonymous session); <c>_push-unregister {token}</c> forgets it
    /// (needs no identity: the token is the phone's own). Both answer Data{_push: {registered}}.</summary>
    private UIIncrementDto PushAction(RunActionRqDto rq)
    {
        var token = StateString(GetState(rq.Parameters, "token"))?.Trim();
        if (!RemotePush.ValidToken(token)) throw new UserFacingException("A push token is needed.");
        var registered = false;
        if (rq.ActionId == RemotePush.UnregisterAction)
            PushTokens.Unregister(token!);
        else if (PushSender is not null
                 && RemotePush.OwnerOf(Principal?.Invoke(), RequestHeader?.Invoke("X-Session-Id")) is { } owner)
        {
            PushTokens.Register(owner, RemotePush.TokenOf(token!,
                StateString(GetState(rq.Parameters, "platform")), StateString(GetState(rq.Parameters, "deviceId")),
                StateString(GetState(rq.Parameters, "ui"))));
            registered = true;
        }
        var data = new Dictionary<string, object?>
        {
            ["_push"] = new Dictionary<string, object?> { ["registered"] = registered },
        };
        return UIIncrementDto.Of(fragments:
            [new UIFragmentDto(rq.InitiatorComponentId ?? "ux_main", null, null, data, "Replace", null)]);
    }

    /// <summary>Sends a push to the principal's phones, off the request thread (nothing when push is
    /// off). What <see cref="PushNotifications.Send(string, PushMessage)"/> reaches once the hosting
    /// subscribed it.</summary>
    public void DeliverPush(string principal, PushMessage message)
    {
        if (PushSender is not { } sender) return;
        var store = PushTokens;
        _ = Task.Run(() => RemotePush.DeliverAsync(principal, message, sender, store));
    }

    /// <summary>The same delivery, awaited (tests).</summary>
    internal Task DeliverPushAsync(string principal, PushMessage message) =>
        PushSender is { } sender ? RemotePush.DeliverAsync(principal, message, sender, PushTokens) : Task.CompletedTask;
}
