package io.mateu.mdd.demoadminpanel.infra.in.ui.users;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import org.springframework.stereotype.Service;

@Service
public class RoleLabelSupplier implements LabelSupplier {

    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
        return switch (String.valueOf(id)) {
            case "1" -> "Admin";
            case "2" -> "Editor";
            case "3" -> "Viewer";
            default -> "?";
        };
    }
}