package io.mateu.mdd.demoadminpanel.infra.in.ui.partialforms;

import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;

@PlainText
@Compact
public class ContactSection {

    @Label("Email")     String email  = "maria.garcia@example.com";
    @Label("Teléfono")  String phone  = "+34 912 345 678";
    @Label("Móvil")     String mobile = "+34 600 112 233";

    @Toolbar
    @Label("Editar")
    Object editar(HttpRequest httpRequest) {
        return Message.success("Editar «Contacto» (toggle pendiente)");
    }
}
