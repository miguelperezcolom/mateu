package io.mateu.mdd.demoadminpanel.infra.in.ui.partialforms;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ServerSideComponent;
import io.mateu.uidl.fluent.Component;

/**
 * Demo de formularios parciales.
 *
 * <p>Cada sección editable es una {@link io.mateu.core.infra.declarative.orchestrators.editableview.EditableView}
 * independiente, embebida mediante un {@link ServerSideComponent}, de modo que alterna lectura/edición
 * por su cuenta. Las secciones no editables se mantienen como subformularios {@code @Inline}.
 */
@UI("/partial-forms")
@Title("Formularios parciales")
@Style(StyleConstants.CONTAINER)
public class PartialFormDemo {

    // ── Sección editable embebida (EditableView independiente) ─────────
    @Section("Datos personales")
    @Label("")
    PersonalDataView personal;

    // ── Secciones aún sin convertir (para contraste) ──────────────────
    @Section("Contacto")
    @Label("") @Inline
    ContactSection contact = new ContactSection();

    @Section("Dirección")
    @Label("") @Inline
    AddressSection address = new AddressSection();

    @Section("Cuenta")
    @Label("") @Inline
    AccountSection account = new AccountSection();
}
