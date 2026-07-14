package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A payment method picker with context and confirm CTA: a row of segmented buttons ({@link
 * PaymentMethod}, initial selection seeded from {@code selected}, toggled client-side), an optional
 * success-tinted context chip ({@code contextLabel} over {@code contextValue}) and a primary {@code
 * confirmLabel} button dispatching {@code actionId} with {@code { "_method": selectedId }}.
 * Design-system neutral, dark-mode aware.
 */
@Builder
public record PaymentPicker(
    String id,
    String actionId,
    List<PaymentMethod> methods,
    String selected,
    String contextLabel,
    String contextValue,
    String confirmLabel,
    String style,
    String cssClasses)
    implements Component {}
