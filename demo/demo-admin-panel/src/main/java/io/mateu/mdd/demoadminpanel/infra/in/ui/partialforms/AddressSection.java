package io.mateu.mdd.demoadminpanel.infra.in.ui.partialforms;

import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;

@PlainText
@Compact
public class AddressSection {

    @Label("Calle")         String street   = "Gran Vía, 28, 3º B";
    @Label("Ciudad")        String city     = "Madrid";
    @Label("Código postal") String zipCode  = "28013";
    @Label("País")          String country  = "España";

    @Toolbar
    @Label("Editar")
    Object editar(HttpRequest httpRequest) {
        return Message.success("Editar «Dirección» (toggle pendiente)");
    }
}
