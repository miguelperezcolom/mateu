package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Multiline;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.data.FieldStereotype;

import java.util.ArrayList;
import java.util.List;

@PlainText
@Compact
public class ClientInfoSection {

    // ── Tab: Info Cardex ──────────────────────────────────────────────
    // Independent embedded component: subscribes to "pax-selected" and reloads only itself with the
    // selected guest's cardex (see CardexView / Cardex), without reloading the rest of the form.
    @Tab("Info Cardex")
    @Label("")
    CardexView cardex = new CardexView();

    // ── Tab: Datos Empresa ────────────────────────────────────────────
    @Tab("Datos Empresa")
    @Label("Razón social")        String companyName;
    @Label("CIF")                 String cif;
    @Label("Email facturación")   String billingEmail;
    @Label("Dirección fiscal")    String fiscalAddress;
    @Label("Forma de pago")       String paymentTerms;

    // ── Tab: Datos Tarjeta ────────────────────────────────────────────
    @Tab("Datos Tarjeta")
    @Label("Tipo tarjeta")        String cardTypeName;
    @Label("4 últimos dígitos")   String cardLast4Tab;
    @Label("Caducidad")           String cardExpiry;
    @Label("Titular")             String cardHolder;
    @Label("Garantía validada")   boolean cardValidated;

    // ── Tab: Histórico cliente ────────────────────────────────────────
    @Tab("Histórico cliente")
    @Stereotype(FieldStereotype.grid)
    List<HistoryStay> historyStays = new ArrayList<>();

    // ── Tab: Preferencias ─────────────────────────────────────────────
    @Tab("Preferencias")
    @Multiline @Label("Preferencias del cliente") String preferenceNotes;

    void populate(ReservationLine line) {
        companyName    = line.getCompanyName();
        cif            = line.getCif();
        billingEmail   = line.getBillingEmail();
        fiscalAddress  = line.getFiscalAddress();
        paymentTerms   = line.getPaymentTerms();

        cardTypeName   = line.getCardTypeName();
        cardLast4Tab   = line.getCardLast4();
        cardExpiry     = line.getCardExpiry();
        cardHolder     = line.getCardHolder();
        cardValidated  = line.isCardValidated();

        historyStays   = new ArrayList<>(line.getHistoryStays());
        preferenceNotes = line.getPreferences();
    }
}
