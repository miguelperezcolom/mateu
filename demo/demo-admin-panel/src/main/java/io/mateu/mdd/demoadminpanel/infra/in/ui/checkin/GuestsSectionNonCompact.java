package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Emits;
import io.mateu.uidl.annotations.PlainText;

/**
 * Non-compact variant of {@link GuestsSection} used by {@link CheckInFormV2}. It inherits every field,
 * grid configuration and toolbar action but <b>drops the class-level {@code @Compact}</b> so the
 * guests grid renders at normal density (wider columns, taller rows).
 *
 * <p>Class-level annotations are not inherited in Java, so the two that must be kept ({@code @PlainText}
 * and {@code @Emits}) are re-declared here; {@code @Compact} is deliberately omitted.
 */
@PlainText
@Emits(events = {"checkin-confirmed", "pax-selected"}, name = "guests-section")
public class GuestsSectionNonCompact extends GuestsSection {}
