package io.mateu.uidl.push;

import io.mateu.uidl.annotations.Experimental;
import lombok.Builder;

/**
 * One phone's push address, as the Mateu app registered it with the reserved {@code _push-register}
 * action: the push service's {@code token} (an Expo push token, {@code ExponentPushToken[…]}), the
 * {@code platform} ({@code ios} | {@code android}), a {@code deviceId} the app drew once per
 * install (a new token of the same device replaces the old one) and {@code ui}, the base url the
 * phone knows this UI by — a push carries it back so a tap opens THIS UI of the phone's list.
 */
@Experimental("remote push (3.0)")
@Builder(toBuilder = true)
public record PushToken(String token, String platform, String deviceId, String ui) {}
