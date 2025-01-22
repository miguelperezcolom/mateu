package com.example.demo.infra.ui.menus.layouts.booking;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.VGap;
import io.mateu.uidl.interfaces.View;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.concurrent.Callable;

@Title("")
record BookingInfoSection(
        @Ignored String id,
        String leadName,
        String service,
        LocalDate serviceStartDate,
        LocalDate serviceEndDate,
        BigDecimal value) {

    @MainAction(order = 0, type = ActionType.Tertiary, position = ActionPosition.Left)
    void back() {

    }

    @MainAction(order = 1, type = ActionType.Secondary, variants = {
            ActionThemeVariant.Error
    })
    void cancelBooking() {

    }

    @MainAction
    void save() {

    }

}

@Title("")
record MyHorizontalLayout(
        BookingInfoSection bookingInfoSection,
        @Width("200px")
        Report financialReport) {

}

@Title("")
@MaxWidth("300px")
class Report {
    @DataOnly
    String id = "46464qsws";

    @Section(value = "", sidePositionedLabel = true, itemLabelWidth = "80px")
    @Output
    @Money
    double value = 1200.1;

    @Output
    @Money
    double invoiced = 20;

    @Output
    @Money
    double paid = 40000.213;

    @Output
    @Money
    @Bold
    double pending = -3421.2;

    VGap gap2 = new VGap("10px");

    @Button(type = ActionType.Secondary, target = ActionTarget.NewModal, modalTitle = "Create invoice" )
    @Width("100%")
    Callable<String> createInvoice = () -> "Hola";

    @Button(type = ActionType.Secondary, target = ActionTarget.NewModal)
    @Width("100%")
    Callable<String> registerPayment = () -> "Hola";

}


@Service
@Scope("prototype")
public class BookingView implements View {

    @Ignored
    String id = "4564564";

    @Slot(SlotName.main)
    @HorizontallyArranged
    MyHorizontalLayout main = new MyHorizontalLayout(new BookingInfoSection(
            "5454",
            "Mateu",
            "Hotel Formentor",
            LocalDate.now(),
            LocalDate.now().plusDays(14),
            BigDecimal.valueOf(200.32)
    ), new Report());

    @Override
    public String toString() {
        return "Booking " + id;
    }
}
