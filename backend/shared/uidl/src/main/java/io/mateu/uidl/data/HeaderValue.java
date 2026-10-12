package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;

/**
 * A LIVE value on the app header — "Business date: 12 Oct", "Shift: Night" — that the server can
 * change while the app is open: return {@link UICommand#updateHeaderValue(String, String)} from an
 * action (every tab of that browser follows), or publish it to every open session with {@link
 * io.mateu.uidl.LiveHeaderValues#publish(String, String)} when the app has {@code @App(liveUpdates
 * = true)}.
 *
 * @param id what the server addresses it by
 * @param label the caption before the value; blank = the value alone
 */
@Experimental("live header values (3.0-alpha, E2 patterns)")
public record HeaderValue(String id, String label, String value) {}
