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

        add(ReservationLine.builder()
                .id("1")
                .localizador("09910174")
                .hotel("RIU PALACE OASIS")
                .agencia("IBEROFERTA")
                .titular("HERNÁNDEZ GONZALEZ, ANA ISABEL")
                .roomType("DBL STD")
                .mealPlan(MealPlan.HB)
                .basePrice(new BigDecimal("121.84"))
                .totalPrice(new BigDecimal("121.84"))
                .pax(2)
                .arrivalDate(today)
                .departureDate(today.plusDays(5))
                .status(CheckInStatus.PENDING)
                .guests(new ArrayList<>(List.of(
                        new GuestData("ANA ISABEL", "HERNÁNDEZ GONZALEZ", DocumentType.DNI,
                                "12345678A", today.plusYears(5), "ESP", LocalDate.of(1985, 3, 15)),
                        new GuestData("CARLOS", "HERNÁNDEZ GONZALEZ", DocumentType.DNI,
                                "87654321B", today.plusYears(3), "ESP", LocalDate.of(1982, 7, 22))
                )))
                .build());

        add(ReservationLine.builder()
                .id("2")
                .localizador("09910175")
                .hotel("RIU PALACE OASIS")
                .agencia("BOOKING.COM")
                .titular("SMITH, JOHN")
                .roomType("SGL STD")
                .assignedRoom("101")
                .mealPlan(MealPlan.BB)
                .basePrice(new BigDecimal("89.50"))
                .totalPrice(new BigDecimal("89.50"))
                .pax(1)
                .arrivalDate(today)
                .departureDate(today.plusDays(3))
                .status(CheckInStatus.PENDING)
                .guests(new ArrayList<>(List.of(
                        new GuestData("JOHN", "SMITH", DocumentType.PASSPORT,
                                "GBR12345", today.plusYears(8), "GBR", LocalDate.of(1978, 11, 30))
                )))
                .build());

        add(ReservationLine.builder()
                .id("3")
                .localizador("09910176")
                .hotel("RIU PALACE OASIS")
                .agencia("EXPEDIA")
                .titular("GARCÍA LÓPEZ, PEDRO")
                .roomType("FAM SUP")
                .mealPlan(MealPlan.AI)
                .basePrice(new BigDecimal("245.00"))
                .totalPrice(new BigDecimal("245.00"))
                .pax(4)
                .arrivalDate(today)
                .departureDate(today.plusDays(7))
                .status(CheckInStatus.PENDING)
                .guests(new ArrayList<>(List.of(
                        new GuestData("PEDRO", "GARCÍA LÓPEZ", DocumentType.DNI,
                                "11223344C", today.plusYears(6), "ESP", LocalDate.of(1980, 5, 10)),
                        new GuestData("MARÍA", "GARCÍA LÓPEZ", DocumentType.DNI,
                                "44332211D", today.plusYears(4), "ESP", LocalDate.of(1983, 8, 25))
                )))
                .build());

        add(ReservationLine.builder()
                .id("4")
                .localizador("09910177")
                .hotel("RIU PALACE OASIS")
                .agencia("DIRECT")
                .titular("MÜLLER, HANS")
                .roomType("DBL SUP")
                .assignedRoom("205")
                .mealPlan(MealPlan.HB)
                .basePrice(new BigDecimal("165.00"))
                .totalPrice(new BigDecimal("165.00"))
                .pax(2)
                .arrivalDate(today.plusDays(1))
                .departureDate(today.plusDays(6))
                .status(CheckInStatus.PENDING)
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
