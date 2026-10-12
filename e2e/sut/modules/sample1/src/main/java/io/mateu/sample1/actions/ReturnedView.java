package io.mateu.sample1.actions;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;

/** What {@link ActionsLab#openAnother()} returns: a plain object rendered as the next view. */
@Title("Returned view")
@ReadOnly
public record ReturnedView(String origin) {}
