package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ReservationLineRepository {

    private final Map<String, ReservationLine> store = new ConcurrentHashMap<>();

    public ReservationLineRepository() {
        var today = LocalDate.now();

        // ---- Hero record: matches the approved prototype (García Romero family) ----
        add(ReservationLine.builder()
                .id("1")
                .localizador("RH-2026-83471")
                .hotel("RIU05 Riu Palace Tenerife")
                .agencia("AG0042 Tui España")
                .titular("García Romero, Miguel")
                .adults(2).children(1).babies(0)
                .chargeType("Pago en front")
                .waitingTime("04:12")
                .tarifaRef("TF-99820-A")
                .tarifaType("b2c2")
                .grupoRes("—").grupoOp("—")
                .mealPlan(MealPlan.HB)
                .arrivalDate(today)
                .departureDate(today.plusDays(3))
                .status(CheckInStatus.PENDING)
                .garantizada(true).terceros(false).pdteInt(false).exp(false).multiple(true)
                .requiere("")
                .vip(true).riuClass("Oro")
                .roomTypePhysical("DBL-V Doble vista mar")
                .roomType("DBL Doble estándar")
                .assignedRoom("")
                .upgrade(true).espera(true)
                .deseos("Cama extra para niño. Habitación en planta alta si es posible.")
                .observacionesInternas("Cliente repetidor, trato preferente. Cumpleaños el 21/06.")
                .avisos("Pendiente de validar documento del segundo adulto.")
                .basePrice(new BigDecimal("945.00"))
                .totalPrice(new BigDecimal("1065.00"))
                .saldoPendiente(new BigDecimal("0.00"))
                .currency("EUR")
                .importes(new ArrayList<>(List.of(
                        new ImporteLine("DBL Doble estándar", new BigDecimal("945.00"), "EUR", "H"),
                        new ImporteLine("UPG Vista mar", new BigDecimal("120.00"), "EUR", "H")
                )))
                .beds("0/2")
                .roomState(RoomState.SUCIA)
                .checkout(true)
                .roomObservations("Minibar repuesto. Caja fuerte operativa.")
                .averias("Grifo del lavabo gotea — aviso a mantenimiento 18/06.")
                .creditCancelled(false).printReceipt(true)
                .creditLimit(new BigDecimal("1500.00"))
                .cardType("VISA Crédito")
                .cardLast4("4421")
                .deposit(new BigDecimal("300.00"))
                .riuClassType("ORO Riu Class Oro")
                .lastHotel("RIU12")
                .preferences("Habitación alta, vista mar, almohada viscoelástica. Cava de bienvenida.")
                .rpc(true).repeated(14).clientType("VIP").attnH(3).lastRoom("412")
                .historyStays(new ArrayList<>(List.of(
                        new HistoryStay("12/2025", "RIU05 Tenerife", 5, "TI", "412", new BigDecimal("1240.00")),
                        new HistoryStay("07/2025", "RIU12 Cancún", 7, "TI", "815", new BigDecimal("2310.00")),
                        new HistoryStay("03/2025", "RIU05 Tenerife", 3, "HB", "307", new BigDecimal("690.00"))
                )))
                .companyName("Viajes Globales S.L.")
                .cif("B-83992011")
                .billingEmail("facturacion@vglobales.com")
                .fiscalAddress("Av. de la Innovación 22, Madrid")
                .paymentTerms("Transferencia 30 días")
                .cardTypeName("VISA Crédito")
                .cardExpiry("08/28")
                .cardHolder("M. García Romero")
                .cardValidated(true)
                .leadEmail("m.garcia@email.com")
                .leadAddress("C/ Mayor 14, 3ºB")
                .leadCity("Madrid").leadCp("28013").leadProvince("Madrid")
                .leadRiuClassNo("RC-7788991")
                .leadDob(LocalDate.of(1985, 6, 21))
                .leadSex(Sex.MALE)
                .leadBirthCity("Sevilla")
                .leadCountryResidence("ES España")
                .leadDocType(DocumentType.DNI)
                .leadDocNumber("12345678Z")
                .leadIssued(LocalDate.of(2020, 1, 10))
                .leadExpiry(LocalDate.of(2030, 1, 10))
                .leadPhone("+34 612 345 678")
                .leadFax("")
                .leadCompanion(false).leadProvisionalCardex(false)
                .leadAcceptsAds("P")
                .leadNationality("ES Española")
                .leadLanguage("ES Español")
                .pax(3)
                .guests(new ArrayList<>(List.of(
                        GuestData.builder().lastName("García Romero").firstName("Miguel")
                                .paxType(PaxType.AD).mealPlan(MealPlan.HB).nationality("ES")
                                .status(PaxStatus.RECEPCION).hasCardex(true).internal(false).aviso(true)
                                .hotelObservations("Cliente VIP — bienvenida especial")
                                .cardex(Cardex.builder()
                                        .fullName("García Romero, Miguel")
                                        .email("m.garcia@email.com")
                                        .phoneFax("+34 612 345 678")
                                        .fullAddress("C/ Mayor 14, 3ºB · 28013 Madrid · ES España")
                                        .natLang("ES Española / ES Español")
                                        .dobSex("1985-06-21 · MALE · Sevilla")
                                        .docInfo("DNI · 12345678Z · cad. 2030-01-10")
                                        .riuClassNo("RC-7788991").acceptsAds("P")
                                        .companion(false).provisionalCardex(false).build())
                                .build(),
                        GuestData.builder().lastName("García Romero").firstName("Laura")
                                .paxType(PaxType.AD).mealPlan(MealPlan.HB).nationality("ES")
                                .status(PaxStatus.PENDIENTE).hasCardex(true).internal(false).aviso(false)
                                .hotelObservations("")
                                .cardex(Cardex.builder()
                                        .fullName("García Romero, Laura")
                                        .email("l.garcia@email.com")
                                        .phoneFax("+34 600 111 222")
                                        .fullAddress("C/ Mayor 14, 3ºB · 28013 Madrid · ES España")
                                        .natLang("ES Española / ES Español")
                                        .dobSex("1987-03-12 · FEMALE · Madrid")
                                        .docInfo("DNI · 87654321X · cad. 2029-05-01")
                                        .riuClassNo("RC-7788992").acceptsAds("N")
                                        .companion(true).provisionalCardex(false).build())
                                .build(),
                        GuestData.builder().lastName("García Soto").firstName("Daniela")
                                .paxType(PaxType.CH).mealPlan(MealPlan.HB).nationality("ES")
                                .status(PaxStatus.PENDIENTE).hasCardex(false).internal(false).aviso(false)
                                .hotelObservations("Cama extra solicitada")
                                .cardex(Cardex.builder()
                                        .fullName("García Soto, Daniela")
                                        .fullAddress("C/ Mayor 14, 3ºB · 28013 Madrid · ES España")
                                        .natLang("ES Española / ES Español")
                                        .dobSex("2016-09-30 · FEMALE")
                                        .docInfo("—").acceptsAds("")
                                        .companion(true).provisionalCardex(true).build())
                                .build()
                )))
                .build());

        // ---- A few lighter arrivals so the listing isn't empty ----
        add(ReservationLine.builder()
                .id("2").localizador("09910175").hotel("RIU05 Riu Palace Tenerife")
                .agencia("BOOKING.COM").titular("Smith, John")
                .adults(1).children(0).babies(0)
                .chargeType("Crédito").waitingTime("00:00")
                .mealPlan(MealPlan.BB)
                .arrivalDate(today).departureDate(today.plusDays(3))
                .status(CheckInStatus.PENDING)
                .roomType("SGL STD").assignedRoom("101")
                .basePrice(new BigDecimal("89.50")).totalPrice(new BigDecimal("89.50"))
                .saldoPendiente(new BigDecimal("89.50")).currency("EUR")
                .pax(1)
                .guests(new ArrayList<>(List.of(
                        GuestData.builder().lastName("Smith").firstName("John").paxType(PaxType.AD)
                                .mealPlan(MealPlan.BB).nationality("GB").status(PaxStatus.CHECKIN)
                                .hasCardex(true)
                                .cardex(Cardex.builder()
                                        .fullName("Smith, John")
                                        .email("john.smith@email.com")
                                        .phoneFax("+44 20 7946 0000")
                                        .fullAddress("221B Baker Street · London · GB")
                                        .natLang("GB British / EN English")
                                        .dobSex("1979-11-02 · MALE · London")
                                        .docInfo("PAS · 5012345 · cad. 2031-02-01")
                                        .acceptsAds("N").companion(false).provisionalCardex(false).build())
                                .build()
                )))
                .build());

        add(ReservationLine.builder()
                .id("3").localizador("09910176").hotel("RIU05 Riu Palace Tenerife")
                .agencia("EXPEDIA").titular("García López, Pedro")
                .adults(2).children(2).babies(0)
                .chargeType("Pago en front").waitingTime("00:00")
                .mealPlan(MealPlan.AI)
                .arrivalDate(today).departureDate(today.plusDays(7))
                .status(CheckInStatus.PENDING)
                .roomType("FAM SUP").assignedRoom("")
                .basePrice(new BigDecimal("245.00")).totalPrice(new BigDecimal("245.00"))
                .saldoPendiente(new BigDecimal("0.00")).currency("EUR")
                .pax(4)
                .guests(new ArrayList<>(List.of(
                        GuestData.builder().lastName("García López").firstName("Pedro").paxType(PaxType.AD)
                                .mealPlan(MealPlan.AI).nationality("ES").status(PaxStatus.RECEPCION).build(),
                        GuestData.builder().lastName("García López").firstName("María").paxType(PaxType.AD)
                                .mealPlan(MealPlan.AI).nationality("ES").status(PaxStatus.PENDIENTE).build()
                )))
                .build());

        add(ReservationLine.builder()
                .id("4").localizador("09910177").hotel("RIU05 Riu Palace Tenerife")
                .agencia("DIRECT").titular("Müller, Hans")
                .adults(2).children(0).babies(0)
                .chargeType("Crédito").waitingTime("00:00")
                .mealPlan(MealPlan.HB)
                .arrivalDate(today.plusDays(1)).departureDate(today.plusDays(6))
                .status(CheckInStatus.PENDING)
                .roomType("DBL SUP").assignedRoom("205")
                .basePrice(new BigDecimal("165.00")).totalPrice(new BigDecimal("165.00"))
                .saldoPendiente(new BigDecimal("0.00")).currency("EUR")
                .pax(2)
                .build());
    }

    private void add(ReservationLine line) {
        store.put(line.getId(), line);
    }

    public List<ReservationLine> findAll(String searchText, LocalDate arrivalDate, CheckInStatus status) {
        return store.values().stream()
                .filter(l -> arrivalDate == null || arrivalDate.equals(l.getArrivalDate()))
                .filter(l -> status == null || status == l.getStatus())
                .filter(l -> searchText == null || searchText.isBlank()
                        || l.getLocalizador().toLowerCase().contains(searchText.toLowerCase())
                        || l.getTitular().toLowerCase().contains(searchText.toLowerCase()))
                .sorted(Comparator.comparing(ReservationLine::getTitular))
                .toList();
    }

    public Optional<ReservationLine> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    public void save(ReservationLine line) {
        store.put(line.getId(), line);
    }
}
