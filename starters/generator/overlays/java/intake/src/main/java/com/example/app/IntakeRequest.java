package com.example.app;

import java.time.LocalDate;

/** A submitted request: one row of the Requests listing. */
public record IntakeRequest(
    String id,
    LocalDate submitted,
    String requester,
    String email,
    Intake.Category category,
    String summary,
    boolean urgent) {}
