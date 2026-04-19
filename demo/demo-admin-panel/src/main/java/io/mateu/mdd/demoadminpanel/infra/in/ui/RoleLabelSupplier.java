package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;

public class RoleLabelSupplier implements LabelSupplier {
    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
        return "Label for " + id;
    }
}
