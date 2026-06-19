package io.mateu.mdd.demoadminpanel.infra.in.ui.reservations;

import io.mateu.mdd.demoadminpanel.infra.in.ui.checkin.MealPlan;
import io.mateu.uidl.interfaces.CrudRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class ReservationRepository implements CrudRepository<Reservation> {

    private final Map<String, Reservation> store = new ConcurrentHashMap<>();
    private final AtomicLong seq = new AtomicLong(100);

    public ReservationRepository() {
        var today = LocalDate.now();
        add(Reservation.builder().id("1").localizador("RES-0001").hotel("Grand Palace Hotel")
                .agencia("Booking.com").titular("García López, Ana").roomType("DBL STD")
                .mealPlan(MealPlan.BB).pax(2).arrivalDate(today).departureDate(today.plusDays(4))
                .totalPrice(new BigDecimal("320.00")).status(ReservationStatus.CONFIRMED).build());
        add(Reservation.builder().id("2").localizador("RES-0002").hotel("Grand Palace Hotel")
                .agencia("Expedia").titular("Smith, John").roomType("SGL STD")
                .mealPlan(MealPlan.HB).pax(1).arrivalDate(today).departureDate(today.plusDays(3))
                .totalPrice(new BigDecimal("195.00")).status(ReservationStatus.CONFIRMED).build());
        add(Reservation.builder().id("3").localizador("RES-0003").hotel("Ocean View Resort")
                .agencia("Direct").titular("Müller, Hans").roomType("FAM SUP")
                .mealPlan(MealPlan.AI).pax(4).arrivalDate(today.plusDays(1)).departureDate(today.plusDays(8))
                .totalPrice(new BigDecimal("980.00")).status(ReservationStatus.CONFIRMED).build());
        add(Reservation.builder().id("4").localizador("RES-0004").hotel("Ocean View Resort")
                .agencia("TUI").titular("Dupont, Marie").roomType("DBL SUP")
                .mealPlan(MealPlan.HB).pax(2).arrivalDate(today.plusDays(2)).departureDate(today.plusDays(9))
                .totalPrice(new BigDecimal("560.00")).status(ReservationStatus.PENDING).build());
        add(Reservation.builder().id("5").localizador("RES-0005").hotel("Grand Palace Hotel")
                .agencia("Iberoferta").titular("Fernández Ruiz, Carlos").roomType("DBL STD")
                .mealPlan(MealPlan.BB).pax(2).arrivalDate(today.minusDays(2)).departureDate(today.plusDays(2))
                .totalPrice(new BigDecimal("280.00")).status(ReservationStatus.CONFIRMED).build());
        add(Reservation.builder().id("6").localizador("RES-0006").hotel("Ocean View Resort")
                .agencia("Booking.com").titular("Rossi, Marco").roomType("SGL STD")
                .mealPlan(MealPlan.BB).pax(1).arrivalDate(today.minusDays(5)).departureDate(today.minusDays(2))
                .totalPrice(new BigDecimal("150.00")).status(ReservationStatus.CANCELLED).build());
        add(Reservation.builder().id("7").localizador("RES-0007").hotel("Grand Palace Hotel")
                .agencia("Direct").titular("Johnson, Emily").roomType("DBL SUP")
                .mealPlan(MealPlan.HB).pax(2).arrivalDate(today.plusDays(5)).departureDate(today.plusDays(12))
                .totalPrice(new BigDecimal("770.00")).status(ReservationStatus.CONFIRMED).build());
        add(Reservation.builder().id("8").localizador("RES-0008").hotel("Ocean View Resort")
                .agencia("TUI").titular("Kowalski, Jan").roomType("FAM STD")
                .mealPlan(MealPlan.AI).pax(3).arrivalDate(today.plusDays(3)).departureDate(today.plusDays(10))
                .totalPrice(new BigDecimal("840.00")).status(ReservationStatus.PENDING).build());
    }

    private void add(Reservation r) {
        store.put(r.getId(), r);
    }

    @Override
    public Optional<Reservation> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public String save(Reservation entity) {
        if (entity.getId() == null || entity.getId().isBlank()) {
            entity.setId(String.valueOf(seq.incrementAndGet()));
        }
        store.put(entity.getId(), entity);
        return entity.getId();
    }

    @Override
    public List<Reservation> findAll() {
        return store.values().stream()
                .sorted(Comparator.comparing(Reservation::getArrivalDate).reversed()
                        .thenComparing(Reservation::getLocalizador))
                .toList();
    }

    @Override
    public void deleteAllById(List<String> ids) {
        ids.forEach(store::remove);
    }
}
