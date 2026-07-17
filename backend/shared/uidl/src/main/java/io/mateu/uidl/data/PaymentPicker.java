package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A payment method picker with context and confirm CTA: a row of segmented buttons ({@link
 * PaymentMethod}, initial selection seeded from {@code selected}, toggled client-side), an optional
 * success-tinted context chip ({@code contextLabel} over {@code contextValue}) and a primary {@code
 * confirmLabel} button dispatching {@code actionId} with {@code { "_method": selectedId }}. An
 * optional {@code methodActionId} is dispatched (also with {@code { "_method": id }}) every time
 * the user PICKS a method — so the backend can react to the selection (e.g. show a redeem-points
 * panel when the loyalty method is chosen). Design-system neutral, dark-mode aware.
 */
@Builder
public record PaymentPicker(
    String id,
    String actionId,
    String methodActionId,
    List<PaymentMethod> methods,
    String selected,
    String contextLabel,
    String contextValue,
    String confirmLabel,
    String style,
    String cssClasses)
    implements Component {}
