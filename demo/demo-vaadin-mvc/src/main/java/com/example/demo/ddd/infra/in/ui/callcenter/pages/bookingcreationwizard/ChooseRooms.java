package com.example.demo.ddd.infra.in.ui.callcenter.pages.bookingcreationwizard;

import io.mateu.core.infra.declarative.WizardStep;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Select;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.OptionsSupplier;

import java.util.List;

public record ChooseRooms(
        @Select
        String roomCode1,
        @Select
        String roomCode2,
        @Select
        String roomCode3,
        @ReadOnly
        double total
) implements WizardStep, OptionsSupplier {
    @Override
    public List<Option> options(String fieldName, HttpRequest httpRequest) {
        return List.of(new Option("1", "1"), new Option("2", "2"), new Option("3", "3"));
    }
}
