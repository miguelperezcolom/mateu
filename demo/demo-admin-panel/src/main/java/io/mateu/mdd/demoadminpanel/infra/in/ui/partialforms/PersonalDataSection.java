package io.mateu.mdd.demoadminpanel.infra.in.ui.partialforms;

import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;

import java.time.LocalDate;

/** Datos de la sección «Datos personales». Es el modelo (T) de {@link PersonalDataView}. */
@Title("Datos personales")
@Compact
public class PersonalDataSection {

    @Label("Nombre")            String firstName = "María";
    @Label("Apellidos")         String lastName  = "García Pérez";
    @Label("NIF / DNI")         String idNumber  = "12345678Z";
    @Label("Fecha nacimiento")  LocalDate birthDate = LocalDate.of(1988, 4, 17);
    @Label("Nacionalidad")      String nationality = "Española";
}
