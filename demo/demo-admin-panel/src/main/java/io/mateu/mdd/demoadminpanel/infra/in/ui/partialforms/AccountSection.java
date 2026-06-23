package io.mateu.mdd.demoadminpanel.infra.in.ui.partialforms;

import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;

import java.time.LocalDate;

/** Sección de solo lectura (sin botón Editar) para contrastar con las secciones editables. */
@PlainText
@Compact
public class AccountSection {

    @Label("Usuario")       String username  = "mgarcia";
    @Label("Alta")          LocalDate createdOn = LocalDate.of(2021, 9, 1);
    @Label("Activo")        boolean active   = true;
}
