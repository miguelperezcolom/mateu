package io.mateu.explorer.examples.behaviour.compact;

import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Title;

/**
 * {@code @Compact}: the same form in high density — lower controls, tighter spacing, smaller labels
 * (the text keeps its size so it stays legible) — for information-dense operational screens.
 */
@Title("Guest — compact")
@Compact
public class CompactGuestForm extends RegularGuestForm {}
