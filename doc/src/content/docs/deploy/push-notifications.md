---
title: "Push notifications to phones"
description: "Reach a user's phone while the Mateu app is suspended or closed: turn remote push on, keep the push tokens, send from your code, and set up FCM and APNs."
---

:::caution[Experimental]
Remote push is new in 3.0 and may still change.
:::

The Mateu phone app posts notifications itself while it runs, but the operating system suspends an
app soon after it leaves the screen. To reach a suspended or closed app, the server has to send a
**remote push**. The pieces:

1. Your app opts in to OS notifications: `@App(osNotifications = true)`.
2. Your server has a **sender**. You can use Mateu's optional sender for Expo's push service, or your
   own `PushSender`.
3. The phone **registers** its push token with your server once the user allows notifications. It
   uses the reserved app-level action `_push-register`.
4. Every `inbox` message Mateu stores for a signed-in user is then also **pushed** to that user's
   phones. So is anything you send with `PushNotifications.send`.

Mateu ships UI only. It never talks to FCM or APNs itself: delivery and token storage are interfaces,
and the Expo sender is a convenience you switch on.

:::note[Your own app, not the Mateu app]
Remote push needs **your own phone app**: a `fixed` build (`MATEU_VARIANT=fixed`) that you publish
with your own Expo project and your own FCM and APNs credentials. The Mateu app in the stores (the
hub, which opens anybody's UI) never registers a push token. If it did, every server its users added
would send notifications as the Mateu app. In the hub, your users still get the inbox (the bell) and
the notifications the app posts itself while it runs.
:::

## Turn it on

```java
@UI("")
@App(inbox = true, osNotifications = true)
public class Office { … }
```

```properties
# application.properties
mateu.push.expo.enabled=true
# optional: the access token of Expo's "enhanced push security"
mateu.push.expo.access-token=${EXPO_ACCESS_TOKEN}
```

The settings also work as environment variables (`MATEU_PUSH_EXPO_ENABLED`,
`MATEU_PUSH_EXPO_ACCESS_TOKEN`). With a sender in place, the app shell carries
`pushNotifications: true`. The phone app then:

- asks for the permission only from the user's tap ("Notify me on this device"),
- registers its Expo push token with `_push-register {token, platform, deviceId, ui}`, at start and
  again each time it comes to the front (a token or a restarted server is caught up),
- sends `_push-unregister {token}` when the user signs out of the UI, removes the UI from the
  phone's list, or turns notifications off in the OS settings,
- opens the UI named by a tapped push at its route, launching the app if it was closed,
- does not show a push that arrives while the app is in front, because the bell and the toast already
  tell the user.

## Send from your code

Mateu sends a push for every `inbox` message to a signed-in user:

```java
return Message.success("Export ready")
        .withAction(MessageAction.open("Download", "/exports/7"))
        .withPersistence(MessagePersistence.inbox);   // stored, shown in the bell, pushed
```

For entries your own code adds, or for anything else, call `PushNotifications`:

```java
inbox.add(user, entry);
LiveNotifications.publish(user, entry);     // the open sessions' bells
PushNotifications.send(user, entry);        // the user's phones

PushNotifications.send(user, PushMessage.of("Night close done", "All 12 properties").withRoute("/close"));
```

A push carries its title, its text and, as data, `ui` (the base url the phone knows the UI by) and
`route`. Sending happens off the calling thread; a failure is logged, never thrown.

## Keep the tokens

Out of the box the tokens are kept in memory: per process, at most 10 phones per user, and **lost on
restart**. Mateu logs a WARN the first time it uses that store. After a restart, a phone receives
nothing until the app comes to the front and registers again. To keep the tokens, implement
`PushTokenStore`:

```java
@Component
class JdbcPushTokens implements PushTokenStore {
    public void register(String principal, PushToken token) { … }   // same token or same deviceId: replace
    public void unregister(String token) { … }                      // wherever it is
    public List<PushToken> tokensFor(String principal) { … }
}
```

When the push service reports a token as no longer registered (Expo's `DeviceNotRegistered`), Mateu
unregisters it. Expo's later receipts are not polled, so a token that fails only there stays until
the phone unregisters it.

## Your own sender

Register a `PushSender` bean, for example one that calls FCM or APNs directly or goes through your
messaging platform. It replaces the Expo sender:

```java
@Component
class OurPushGateway implements PushSender {
    public PushResult send(PushMessage message, List<PushToken> tokens) {
        // deliver; put token.ui() and message.route() in each push's data
        return new PushResult(accepted, goneTokens);
    }
}
```

Each push must carry `ui` and `route` as data, or a tap opens the app without knowing where to go.

## Who a token belongs to

`principal` is always the identity your framework authenticated, never a value from the phone. An
anonymous phone's token is kept under its session (`session:<X-Session-Id>`): Mateu pushes no inbox
messages to it, because anonymous inbox messages are not stored. Reach it with
`PushNotifications.sendToSession(sessionId, message)`. Unregistering needs no sign-in, since the
token is the phone's own secret and forgetting it only stops pushes to that phone.

## .NET and Python

| | .NET | Python |
|---|---|---|
| Expo sender | `o.ExpoPush = true`, `o.ExpoPushAccessToken` (or the `MATEU_PUSH_EXPO_*` variables) | `add_mateu(..., expo_push=True, expo_push_access_token=…)` (or the variables) |
| Your sender | an `IPushSender` service | `add_mateu(push_sender=…)` (a `PushSender`) |
| Your token store | an `IPushTokenStore` service | `add_mateu(push_token_store=…)` (a `PushTokenStore`) |
| Send from code | `PushNotifications.Send(user, entry)` | `PushNotifications.send(user, entry)` |

## Why push needs your own app

The code supports remote push everywhere. What turns it on is the **build**: a `fixed` app with push
credentials. Here is why it is not a setting each UI brings:

- **A push goes out under the app's store identity.** Apple accepts a push to an iPhone only when a
  key of the team that signed the app sends it. Google delivers through the Firebase project built
  into the app. A UI cannot bring its own keys at run time. They would belong to another team or
  project, and Apple would refuse them.
- **The Mateu app opens anybody's UI.** If it registered push tokens, every server its users added
  would send notifications as the Mateu app, and the volume and any abuse would count against
  Mateu's accounts with Expo, Apple and Google.
- **Your own app keeps your notifications yours.** A fixed build has its own Expo project, Firebase
  project and APNs key. Your notifications go out under your name and only your servers send them.
  Turn on Expo's *enhanced push security* and pass `mateu.push.expo.access-token`, so no one else can
  send to your users.

How to switch it on, in short: build with `MATEU_VARIANT=fixed` (see
[Hub or fixed](/deploy/mobile-app-stores/#hub-or-fixed-mateu_variant)), add the FCM and APNs
credentials below, publish the app, and set `mateu.push.expo.enabled=true` on your server.

A build records whether it was set up for push in `extra.remotePush`, and the app asks for a token
only when that is `true`. A `hub` build, or a binary built before this rule that receives newer
JavaScript over the air, never asks for one.

## Phone set-up (owner steps)

Your fixed app gets its Expo push token through Google's FCM and Apple's APNs, which need credentials
that only the owner of the store accounts can create: a `google-services.json` and the FCM V1 key for
Android, and an APNs key for iOS. A build without them still works, but gets no token, and a `hub`
build ignores them. The steps are
in [Publishing to the App Store and Google Play › Push notifications](/deploy/mobile-app-stores/#push-notifications-fcm-and-apns-credentials).

## Related

- [Notification inbox](/ux-patterns/notification-inbox/): the bell, inbox messages, OS notifications
- [Publishing to the App Store and Google Play](/deploy/mobile-app-stores/)
