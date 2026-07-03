package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Multiline;
import io.mateu.uidl.annotations.PlainText;

/** "Preferencias" section for {@link CheckInFormV2} (formerly a tab of ClientInfoSection). */
@PlainText
public class PreferencesSection {

    @Multiline
    @Label("Preferencias del cliente")
    String preferenceNotes;

    void populate(ReservationLine line) {
        preferenceNotes = line.getPreferences();
    }
}
