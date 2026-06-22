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
import java.util.stream.Collectors;
import java.util.stream.Stream;

@PlainText
@Compact
public class ClientInfoSection {

    // ── Tab: Info Cardex ──────────────────────────────────────────────
    @Tab("Info Cardex")
    @Label("Titular")             String leadFullName;
    @Label("Email")               String leadEmail;
    @Label("Teléfono / Fax")      String leadPhoneFax;
    @Label("Dirección")           String leadFullAddress;
    @Label("Nac. / Idioma")       String leadNatLang;
    @Label("F. nacimiento")       String leadDobSex;
    @Label("Documento")           String leadDocInfo;
    @Label("Nº Riu Class")        String leadRiuClassNo;
    @Label("Acepta publicidad")   String leadAcceptsAds;
    @Stereotype(FieldStereotype.badge) @Label("Acompañante")        boolean leadCompanion;
    @Stereotype(FieldStereotype.badge) @Label("Cardex provisional") boolean leadProvisionalCardex;

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
        var lead = line.getGuests().isEmpty() ? null : line.getGuests().get(0);
        leadFullName     = join(", ",
                lead != null ? lead.getLastName() : null,
                lead != null ? lead.getFirstName() : null);
        leadEmail        = line.getLeadEmail();
        leadPhoneFax     = join(" · ", line.getLeadPhone(), line.getLeadFax());
        leadFullAddress  = join(", ",
                line.getLeadAddress(),
                join(" ", line.getLeadCp(), line.getLeadCity()),
                line.getLeadProvince(),
                line.getLeadCountryResidence());
        leadNatLang      = join(" / ", line.getLeadNationality(), line.getLeadLanguage());
        leadDobSex       = join(" · ",
                line.getLeadDob() != null ? line.getLeadDob().toString() : null,
                line.getLeadSex() != null ? line.getLeadSex().name() : null,
                line.getLeadBirthCity());
        leadDocInfo      = join(" · ",
                line.getLeadDocType() != null ? line.getLeadDocType().name() : null,
                line.getLeadDocNumber(),
                line.getLeadIssued() != null ? "exp. " + line.getLeadIssued() : null,
                line.getLeadExpiry() != null ? "cad. " + line.getLeadExpiry() : null);
        leadRiuClassNo         = line.getLeadRiuClassNo();
        leadAcceptsAds         = line.getLeadAcceptsAds();
        leadCompanion          = line.isLeadCompanion();
        leadProvisionalCardex  = line.isLeadProvisionalCardex();

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

    private static String join(String sep, String... parts) {
        return Stream.of(parts)
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.joining(sep));
    }
}
