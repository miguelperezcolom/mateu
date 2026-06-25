package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Multiline;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.ArrayList;
import java.util.List;

@PlainText
@Compact
@io.mateu.uidl.annotations.Title("")
public class ClientInfoSection {

    @Hidden String id;

    // ── Tab: Info Cardex ──────────────────────────────────────────────
    // Independent embedded component: subscribes to "pax-selected" and reloads only itself with the
    // selected guest's cardex (see CardexView / Cardex), without reloading the rest of the form.
    // @Inline drops the embedded view's own page title and the outlined card around its single
    // section, since the surrounding tab already provides framing.
    @Tab("Info Cardex")
    @Label("")
    @Inline
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

    @Toolbar
    @Label("Editar cardex")
    Object editCardex(HttpRequest httpRequest) {
        // The pax to edit = the selected guest row (reliably carried in the form state), or the lead.
        var selected = httpRequest.getSelectedRows("guestList-guests", GuestData.class)
                .stream().findFirst().orElse(null);
        var service = MateuBeanProvider.getBean(CardexService.class);
        var guest = service.resolveGuest(id, selected);
        var guestFullName = guest != null ? CardexService.fullName(guest) : null;
        return Dialog.builder()
                .headerTitle("Editar cardex")
                .width("520px")
                .closeButtonOnHeader(true)
                .content(MateuBeanProvider.getBean(CardexEditDialog.class).load(id, guestFullName))
                .build();
    }

    @Toolbar
    @Label("Editar datos empresa")
    Object editCompany(HttpRequest httpRequest) {
        return Dialog.builder()
                .headerTitle("Editar datos de empresa")
                .width("520px")
                .closeButtonOnHeader(true)
                .content(MateuBeanProvider.getBean(CompanyDataDialog.class)
                        .load(id, companyName, cif, billingEmail, fiscalAddress, paymentTerms))
                .build();
    }

    void populate(ReservationLine line) {
        id             = line.getId();
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
