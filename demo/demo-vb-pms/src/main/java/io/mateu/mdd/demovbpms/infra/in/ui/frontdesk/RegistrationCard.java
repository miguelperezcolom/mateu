package io.mateu.mdd.demovbpms.infra.in.ui.frontdesk;

import io.mateu.uidl.annotations.FileUpload;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PhotoCapture;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Signature;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.UploadableImage;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

/**
 * Registration card at check-in (OPERA Cloud 26.3 user guide, 004 "Checking in Reservations" —
 * identification panel, deposit, and the registration card "signed directly on the tablet"; 002
 * "Using the Desktop ID Document Scanner" — on mobile, a camera). Every field type the PMS needs.
 */
@UI("/registration-card")
@Title("Registration card")
public class RegistrationCard {

  public enum DocumentType {
    PASSPORT,
    ID_CARD,
    DRIVING_LICENCE
  }

  public enum Preference {
    HIGH_FLOOR,
    QUIET_ROOM,
    NEAR_LIFT,
    FEATHER_FREE,
    LATE_CHECKOUT,
    NEWSPAPER
  }

  @Section("Guest")
  @NotEmpty
  String guest = "Johnson, Yuki";

  String room = "107";

  LocalDate departure = LocalDate.of(2026, 10, 13);

  @Section("Identification")
  @Stereotype(FieldStereotype.radio)
  DocumentType documentType = DocumentType.PASSPORT;

  String documentNumber = "X1234567";

  @PhotoCapture
  String documentScan;

  @Section("Stay")
  @Stereotype(FieldStereotype.multiSelect)
  java.util.List<Preference> preferences = java.util.List.of(Preference.QUIET_ROOM);

  @Stereotype(FieldStereotype.money)
  BigDecimal deposit = new BigDecimal("150.00");

  @FileUpload(accept = "application/pdf,image/*")
  @Label("Voucher (PDF)")
  String voucher;

  @UploadableImage
  @Label("Guest photo")
  String photo;

  @Section("Signature")
  @Signature
  @Label("Guest signature")
  String signature;

  @Toolbar
  public Message completeCheckIn() {
    return new Message(
        "Checked in "
            + guest
            + " · "
            + documentType
            + " · prefs "
            + preferences
            + " · deposit "
            + deposit
            + " · signed: "
            + (signature != null && !signature.isBlank())
            + " · scan: "
            + (documentScan != null && !documentScan.isBlank())
            + " · voucher: "
            + (voucher != null && !voucher.isBlank()));
  }
}
