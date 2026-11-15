package io.mateu.test.docs.crudscreens;

import java.time.LocalDate;

/** Level 3: the detail's own model. */
public record CustomerCard(String name, String email, LocalDate customerSince, String activity) {}
