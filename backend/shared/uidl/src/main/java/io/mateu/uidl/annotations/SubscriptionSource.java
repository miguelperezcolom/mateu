package io.mateu.uidl.annotations;

/**
 * Where a {@link SubscribeTo} subscription listens for the event.
 *
 * <ul>
 *   <li>{@link #DOCUMENT} — global event bus: the subscriber reacts to the event no matter which
 *       component emitted it. This is the recommended default for inter-component communication.
 *   <li>{@link #COMPONENT} — the subscriber reacts only to events emitted by a specific component,
 *       identified by its logical name (see {@link Emits#name()} and {@link SubscribeTo#from()}).
 *   <li>{@link #SELF} — the subscriber reacts only to events bubbling up from its own DOM subtree
 *       (its descendants). This is the legacy behaviour of {@code @Trigger(OnCustomEvent)}.
 * </ul>
 */
public enum SubscriptionSource {
  DOCUMENT,
  COMPONENT,
  SELF
}
