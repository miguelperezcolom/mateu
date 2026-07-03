package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;

import java.math.BigDecimal;

@PlainText
@Compact
@io.mateu.uidl.annotations.Title("")
public class FoliosSection {

    @Hidden String id;

    @Label("Crédito cancelado") boolean creditCancelled;
    @Label("Imprimir recibo")   boolean printReceipt;
    @Stereotype(FieldStereotype.money) @Label("Límite crédito")    BigDecimal creditLimit;
    @Label("Tipo tarjeta")      String cardType;
    @Label("4 últimos dígitos") String cardLast4;
    @Stereotype(FieldStereotype.money) @Label("Entrega a cuenta")  BigDecimal deposit;
    @Stereotype(FieldStereotype.money) @Label("Saldo pendiente")   BigDecimal saldoPendiente;

    @Toolbar
    @Action(shortcut = "ctrl+alt+g")
    @Label("Límite crédito")
    Object editCreditLimit(HttpRequest httpRequest) {
        return Dialog.builder()
                .headerTitle("Modificar límite de crédito")
                .width("420px")
                .closeButtonOnHeader(true)
                .content(MateuBeanProvider.getBean(CreditLimitDialog.class).load(id, creditLimit))
                .build();
    }

    @Toolbar
    @Action(shortcut = "ctrl+alt+o")
    @Label("Introducir cobro")
    Object addCharge(HttpRequest httpRequest) {
        return Dialog.builder()
                .headerTitle("Introducir cobro")
                .width("420px")
                .closeButtonOnHeader(true)
                .content(MateuBeanProvider.getBean(ChargeDialog.class).load(id))
                .build();
    }

    void populate(ReservationLine line) {
        id              = line.getId();
        creditCancelled = line.isCreditCancelled();
        printReceipt    = line.isPrintReceipt();
        creditLimit     = line.getCreditLimit();
        cardType        = line.getCardType();
        cardLast4       = line.getCardLast4();
        deposit         = line.getDeposit();
        saldoPendiente  = line.getSaldoPendiente();
    }

    void applyTo(ReservationLine line) {
        line.setCreditCancelled(creditCancelled);
        line.setPrintReceipt(printReceipt);
        line.setCreditLimit(creditLimit);
        line.setDeposit(deposit);
    }
}
