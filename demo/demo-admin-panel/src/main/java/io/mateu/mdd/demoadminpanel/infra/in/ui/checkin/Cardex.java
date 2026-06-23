package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.SubscriptionSource;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.FieldStereotype;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The cardex (per-pax client data) shown in the check-in screen.
 *
 * <p>Rendered as an independent embedded component via {@link CardexView}. It subscribes to the
 * {@code pax-selected} event (emitted when a guest row is selected in {@code GuestsSection}) so it
 * reloads <strong>itself</strong> with the selected pax's data — the rest of the form is untouched.
 *
 * <p>The {@code @SubscribeTo} must live here, on the loaded entity (the "model view"), not on
 * {@link CardexView}: {@code MultiView.wrapView} maps the component's triggers from this entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@PlainText
@Compact
@Title("Info cardex")
@SubscribeTo(event = "pax-selected", action = "reloadPax", source = SubscriptionSource.DOCUMENT)
public class Cardex {

    @Label("Titular")             String fullName;
    @Label("Email")               String email;
    @Label("Teléfono / Fax")      String phoneFax;
    @Label("Dirección")           String fullAddress;
    @Label("Nac. / Idioma")       String natLang;
    @Label("F. nacimiento")       String dobSex;
    @Label("Documento")           String docInfo;
    @Label("Nº Riu Class")        String riuClassNo;
    @Label("Acepta publicidad")   String acceptsAds;
    @Stereotype(FieldStereotype.badge) @Label("Acompañante")        boolean companion;
    @Stereotype(FieldStereotype.badge) @Label("Cardex provisional") boolean provisionalCardex;
}
