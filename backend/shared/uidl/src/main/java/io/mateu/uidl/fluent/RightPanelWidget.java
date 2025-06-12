package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.ContentSupplier;

public record RightPanelWidget(String label, ContentSupplier<?> contentSupplier) {}
