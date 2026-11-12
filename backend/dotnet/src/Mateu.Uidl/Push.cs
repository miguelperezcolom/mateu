namespace Mateu.Uidl;

// Push notifications on the Mateu mobile app — C# analogues of Java's io.mateu.uidl.data.PushRegistration
// and io.mateu.uidl.interfaces.PushTokenRegistry. EXPERIMENTAL: may change in a minor release.

/// <summary>One device asking ONE UI for push notifications (or to stop them): what the Mateu
/// mobile app sends with the <c>_push-register</c> / <c>_push-unregister</c> app-level actions,
/// already validated. <see cref="Token"/> is the device's Expo push token (keep it like a
/// credential); <see cref="Service"/> is "expo"; <see cref="Platform"/> "ios" or "android";
/// <see cref="UiKey"/> the opaque key the app drew for THIS UI on THIS device — send it back in
/// every push as <c>data.mateu.ui</c>; <see cref="Principal"/> the caller the host authenticated
/// (null = anonymous), never a value from the request body. EXPERIMENTAL.</summary>
public sealed record PushRegistration(string Token, string Service, string Platform, string UiKey, string? Principal)
{
    /// <summary>The push service of the Mateu mobile app (Expo Push Service → APNs / FCM).</summary>
    public const string Expo = "expo";
}

/// <summary>Implemented by the app class to let the Mateu mobile app receive PUSH notifications from
/// this UI: the app's drawer offers "Notifications on this phone", which registers the device's
/// Expo push token with this UI only; turning it off or removing the UI unregisters it. Mateu ships
/// UI only — the token store and the sending are yours: post to
/// <c>https://exp.host/--/api/v2/push/send</c> with <c>"data": {"mateu": {"ui": UiKey, "route":
/// "/orders/42"}}</c> and the phone opens that route of this UI on tap. Scope registrations to their
/// <see cref="PushRegistration.Principal"/>. (C# analogue of Java's PushTokenRegistry.)
/// EXPERIMENTAL.</summary>
public interface IPushTokenRegistry
{
    /// <summary>The device wants this UI's notifications (sent again on every app start: be idempotent).</summary>
    void RegisterPushToken(PushRegistration registration);

    /// <summary>The device no longer wants them.</summary>
    void UnregisterPushToken(PushRegistration registration);
}
