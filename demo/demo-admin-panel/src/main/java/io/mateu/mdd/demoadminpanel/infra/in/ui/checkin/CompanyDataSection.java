package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;

/** "Datos empresa" section for {@link CheckInFormV2} (formerly a tab of ClientInfoSection). */
@PlainText
public class CompanyDataSection {

    @Hidden String id;

    @Label("Razón social")      String companyName;
    @Label("CIF")               String cif;
    @Label("Email facturación") String billingEmail;
    @Label("Dirección fiscal")  String fiscalAddress;
    @Label("Forma de pago")     String paymentTerms;

    @Toolbar
    @Action(shortcut = "ctrl+alt+m")
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
        id            = line.getId();
        companyName   = line.getCompanyName();
        cif           = line.getCif();
        billingEmail  = line.getBillingEmail();
        fiscalAddress = line.getFiscalAddress();
        paymentTerms  = line.getPaymentTerms();
    }
}
