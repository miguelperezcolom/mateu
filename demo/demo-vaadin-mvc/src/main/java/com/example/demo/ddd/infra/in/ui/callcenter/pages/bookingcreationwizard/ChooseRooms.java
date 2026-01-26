package com.example.demo.ddd.infra.in.ui.callcenter.pages.bookingcreationwizard;

import io.mateu.core.infra.declarative.WizardStep;
import io.mateu.uidl.annotations.Choice;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Select;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.OptionsSupplier;

import java.util.List;
import java.util.Map;

public record ChooseRooms(
        @Choice(style = "min-width: 80rem;")
        @Colspan(2)
        String roomCode1,
        @Choice(style = "min-width: 80rem;")
        @Colspan(2)
        String roomCode2,
        @Choice(style = "min-width: 80rem;")
        @Colspan(2)
        String roomCode3,

        @ReadOnly
        String total,
        @Hidden
        Map<String, Double> prices
) implements WizardStep, OptionsSupplier {
    @Override
    public List<Option> options(String fieldName, HttpRequest httpRequest) {
        return List.of(
                new Option("DBL", "DOBLE", "200.21", "/images/rooms/room-1.jpg", "width: 6rem;"),
                new Option("DBVM", "DOBLE VISTA MAR", "150.22", "/images/rooms/room-2.jpg", "width: 6rem;"),
                new Option("SUI", "SUITE", "250.23", "/images/rooms/room-3.jpg", "width: 6rem;")
        );
    }
}
