package io.mateu.test.docs.crudscreens;

import io.mateu.uidl.annotations.ReadOnly;
import jakarta.validation.constraints.NotEmpty;

/** Level 3: the editor's own model — only what may change. */
public record CustomerEditor(@ReadOnly String id, @NotEmpty String name, String email) {}
