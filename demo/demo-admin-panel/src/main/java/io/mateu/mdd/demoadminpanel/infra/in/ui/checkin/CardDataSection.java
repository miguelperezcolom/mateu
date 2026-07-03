package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;

/** "Datos tarjeta" section for {@link CheckInFormV2} (formerly a tab of ClientInfoSection). */
@PlainText
public class CardDataSection {

    @Label("Tipo tarjeta")      String cardTypeName;
    @Label("4 últimos dígitos") String cardLast4;
    @Label("Caducidad")         String cardExpiry;
    @Label("Titular")           String cardHolder;
    @Label("Garantía validada") boolean cardValidated;

    void populate(ReservationLine line) {
        cardTypeName  = line.getCardTypeName();
        cardLast4     = line.getCardLast4();
        cardExpiry    = line.getCardExpiry();
        cardHolder    = line.getCardHolder();
        cardValidated = line.isCardValidated();
    }
}
