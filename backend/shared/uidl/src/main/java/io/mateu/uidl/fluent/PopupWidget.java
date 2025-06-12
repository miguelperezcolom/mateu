package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.ContentSupplier;

public record PopupWidget(String label, ContentSupplier<?> contentSupplier) {}
