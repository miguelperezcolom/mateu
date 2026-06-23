package io.mateu.mdd.demoadminpanel.infra.in.ui.partialforms;

import io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Sección «Datos personales» como vista editable independiente.
 *
 * <p>Embebida en {@link PartialFormDemo} mediante un {@code ServerSideComponent}, alterna por sí
 * misma entre modo lectura (botón Editar) y modo edición (Grabar / Cancelar) sin afectar a las
 * demás secciones.
 */
@UI("/pf-personal")
public class PersonalDataView extends AutoEditableView<PersonalDataSection> {

    /** Almacén mock en memoria (singleton para la demo). */
    private static PersonalDataSection store = new PersonalDataSection();

    @Override
    public PersonalDataSection load(HttpRequest httpRequest) {
        return store;
    }

    @Override
    public void persist(PersonalDataSection entity, HttpRequest httpRequest) {
        store = entity;
    }
}
