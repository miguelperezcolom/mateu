package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * The full reservation backing the check-in screen.
 * It is intentionally wide: the check-in desk shows the whole reservation at once.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationLine {

    String id;

    // --- Reservation (general) ---
    String localizador;
    String hotel;
    String agencia;
    String titular;
    int adults;
    int children;
    int babies;
    String chargeType;          // tipo cobro
    String waitingTime;         // tiempo esperando ("04:12")
    String tarifaRef;
    String tarifaType;
    String grupoRes;
    String grupoOp;
    MealPlan mealPlan;
    LocalDate arrivalDate;
    LocalDate departureDate;
    CheckInStatus status;

    // --- Flags ---
    boolean garantizada;
    boolean terceros;
    boolean pdteInt;
    boolean exp;
    boolean multiple;
    String requiere;
    boolean vip;
    String riuClass;            // e.g. "Oro"

    // --- Check-in / room assignment ---
    String roomTypePhysical;    // tipo habitación física
    String roomType;            // tipo habitación contratada
    String assignedRoom;        // nº habitación
    boolean upgrade;
    boolean espera;
    String deseos;
    String observacionesInternas;
    String avisos;

    // --- Pricing ---
    BigDecimal basePrice;
    BigDecimal totalPrice;
    BigDecimal saldoPendiente;
    String currency;
    @Builder.Default
    List<ImporteLine> importes = new ArrayList<>();

    // --- Room info (right column) ---
    String beds;                // "0/2"
    RoomState roomState;
    boolean checkout;
    String roomObservations;
    String averias;

    // --- Folio / deposits ---
    boolean creditCancelled;
    boolean printReceipt;
    BigDecimal creditLimit;
    String cardType;
    String cardLast4;
    BigDecimal deposit;

    // --- Client history ---
    String riuClassType;
    String lastHotel;
    String preferences;
    boolean rpc;
    int repeated;
    String clientType;
    int attnH;
    String lastRoom;
    @Builder.Default
    List<HistoryStay> historyStays = new ArrayList<>();

    // --- Company data (tied to reservation) ---
    String companyName;
    String cif;
    String billingEmail;
    String fiscalAddress;
    String paymentTerms;

    // --- Card data (tied to reservation) ---
    String cardTypeName;
    String cardExpiry;
    String cardHolder;
    boolean cardValidated;

    // --- Lead guest cardex (tied to pax) ---
    String leadEmail;
    String leadAddress;
    String leadCity;
    String leadCp;
    String leadProvince;
    String leadRiuClassNo;
    LocalDate leadDob;
    Sex leadSex;
    String leadBirthCity;
    String leadCountryResidence;
    DocumentType leadDocType;
    String leadDocNumber;
    LocalDate leadIssued;
    LocalDate leadExpiry;
    String leadPhone;
    String leadFax;
    boolean leadCompanion;
    boolean leadProvisionalCardex;
    String leadAcceptsAds;
    String leadNationality;
    String leadLanguage;

    int pax;
    @Builder.Default
    List<GuestData> guests = new ArrayList<>();
}
