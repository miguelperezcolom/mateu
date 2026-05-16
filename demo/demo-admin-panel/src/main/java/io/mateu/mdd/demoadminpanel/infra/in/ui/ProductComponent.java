package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Lookup;

public record ProductComponent(
        String code,
        int quantity,
        @Lookup(bubble = true)
        String relatedComponentCode,
        boolean special,
        @Hidden("!state['special']")
        String comment) {
}
