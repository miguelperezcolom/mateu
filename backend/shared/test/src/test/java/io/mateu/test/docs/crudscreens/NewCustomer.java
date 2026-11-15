package io.mateu.test.docs.crudscreens;

import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import jakarta.validation.constraints.NotEmpty;

/** Level 3: the creation form's own model — the minimum to open an account. */
public record NewCustomer(@EditableOnlyWhenCreating @NotEmpty String id, @NotEmpty String name) {}
