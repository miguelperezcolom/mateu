package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.ConfirmOnNavigationIfDirty;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.data.*;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@Scope("prototype")
@Route(value = "/:id/checkin", uis = {"/checkin"})
@Trigger(type = TriggerType.OnLoad, actionId = "load")
@ConfirmOnNavigationIfDirty
@Style(StyleConstants.CONTAINER)
@Title("Check-in")
public class CheckInForm {

    final ReservationLineRepository repository;

    public CheckInForm(ReservationLineRepository repository) {
        this.repository = repository;
    }

    String id;

    @Section(value = "Reservation", columns = 3)
    @ReadOnly @Label("Localizador") String localizador;
    @ReadOnly @Label("Hotel") String hotel;
    @ReadOnly @Label("Arrival") LocalDate arrivalDate;
    @ReadOnly @Label("Departure") LocalDate departureDate;
    @ReadOnly @Label("Nights") int nights;
    @ReadOnly @Label("Status") String reservationStatus;

    @Section(value = "Guest information", columns = 2)
    @Label("Lead guest") String titular;
    @Label("Agency / Channel") String agencia;

    @Section(value = "Guests", columns = 1)
    @Stereotype(FieldStereotype.grid)
    List<GuestData> guests = new ArrayList<>();

    @Section(value = "Room & Stay", columns = 2)
    @ReadOnly @Label("Room type (booked)") String roomType;
    @Label("Assigned room") String assignedRoom;
    @Label("Meal plan") MealPlan mealPlan;

    @Section(value = "Pricing", columns = 2)
    @ReadOnly @Label("Base price") BigDecimal basePrice;
    @Label("Total price") BigDecimal totalPrice;

    Object load(HttpRequest httpRequest) {
        return repository.findById(id).map(line -> {
            localizador = line.getLocalizador();
            hotel = line.getHotel();
            arrivalDate = line.getArrivalDate();
            departureDate = line.getDepartureDate();
            nights = (int) ChronoUnit.DAYS.between(line.getArrivalDate(), line.getDepartureDate());
            reservationStatus = line.getStatus().name();
            titular = line.getTitular();
            agencia = line.getAgencia();
            roomType = line.getRoomType();
            assignedRoom = line.getAssignedRoom();
            mealPlan = line.getMealPlan();
            basePrice = line.getBasePrice();
            totalPrice = line.getTotalPrice();
            guests = new ArrayList<>(line.getGuests());
            return (Object) new State(this);
        }).orElse(Message.success("Reservation not found"));
    }

    @Button
    Object save(HttpRequest httpRequest) {
        return repository.findById(id).map(line -> {
            line.setTitular(titular);
            line.setAgencia(agencia);
            line.setAssignedRoom(assignedRoom);
            line.setMealPlan(mealPlan);
            line.setTotalPrice(totalPrice);
            line.setGuests(guests);
            repository.save(line);
            return (Object) List.of(
                    Message.success("Saved"),
                    UICommand.markAsClean()
            );
        }).orElse(Message.success("Reservation not found"));
    }

    @Button
    @Label("Confirm check-in")
    Object confirmCheckin(HttpRequest httpRequest) {
        return repository.findById(id).map(line -> {
            line.setTitular(titular);
            line.setAgencia(agencia);
            line.setAssignedRoom(assignedRoom);
            line.setMealPlan(mealPlan);
            line.setTotalPrice(totalPrice);
            line.setGuests(guests);
            line.setStatus(CheckInStatus.CHECKED_IN);
            repository.save(line);
            return (Object) List.of(
                    Message.success("Check-in confirmed for " + titular),
                    MateuBeanProvider.getBean(CheckInListing.class)
            );
        }).orElse(Message.success("Reservation not found"));
    }

    @Button
    @Label("Print welcome sheet")
    Object printWelcomeSheet(HttpRequest httpRequest) {
        return Message.success("Welcome sheet sent to print queue for " + titular);
    }
}
