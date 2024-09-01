package com.example.demo.infra.ircs.environments;

import io.mateu.core.domain.uidefinition.shared.data.Status;

import java.time.LocalDate;

public record EnvironmentRow(String customer, String country, String city, String name, EHRType EHRType, LocalDate date, Status status) {
}
