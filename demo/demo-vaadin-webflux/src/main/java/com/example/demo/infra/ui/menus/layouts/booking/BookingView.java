package com.example.demo.infra.ui.menus.layouts.booking;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.RemoteJourney;
import io.mateu.uidl.interfaces.View;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;

@Caption("")
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

@Caption("")
record MyHorizontalLayout(
        BookingInfoSection bookingInfoSection,
        @Width("200px")
        Report financialReport) {

}

@Caption("")
@MaxWidth("300px")
record Report(
        @DataOnly
        String id,

        @Section(value = "", sidePositionedLabel = true, itemLabelWidth = "80px")
        @Output
        @Money
        double value,

        @Output
        @Money
        double invoiced,

        @Output
        @Money
        double paid,

        @Output
        @Money
        @Bold
        double pending) {

}


@Service
@Scope("prototype")
public class BookingView implements View {

    @Ignored
    String id = "4564564";

    @Slot(SlotName.main)
            @HorizontalLayout
    MyHorizontalLayout main = new MyHorizontalLayout(new BookingInfoSection(
            "5454",
            "Mateu",
            "Hotel Formentor",
            LocalDate.now(),
            LocalDate.now().plusDays(14),
            BigDecimal.valueOf(200.32)
    ), new Report(
            "wedwed",
            12123.45,
            100.01,
            200
            ,-1032.1
    ));

    @Override
    public String toString() {
        return "Booking " + id;
    }
}
