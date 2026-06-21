package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;

import java.math.BigDecimal;

@PlainText
@Compact
public class FoliosSection {

    @Label("Crédito cancelado") boolean creditCancelled;
    @Label("Imprimir recibo")   boolean printReceipt;
    @Label("Límite crédito")    BigDecimal creditLimit;
    @Label("Tipo tarjeta")      String cardType;
    @Label("4 últimos dígitos") String cardLast4;
    @Label("Entrega a cuenta")  BigDecimal deposit;
    @Label("Saldo pendiente")   BigDecimal saldoPendiente;

    void populate(ReservationLine line) {
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
