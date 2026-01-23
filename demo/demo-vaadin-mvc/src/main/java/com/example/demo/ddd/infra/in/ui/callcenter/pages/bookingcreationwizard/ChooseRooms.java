package com.example.demo.ddd.infra.in.ui.callcenter.pages.bookingcreationwizard;

import io.mateu.core.infra.declarative.WizardStep;

public record ChooseRooms(
        String roomCode1,
        String roomCode2,
        String roomCode3,
        double total
) implements WizardStep {
}
