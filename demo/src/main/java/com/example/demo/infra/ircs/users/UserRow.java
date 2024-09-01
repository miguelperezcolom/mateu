package com.example.demo.infra.ircs.users;

import io.mateu.core.domain.uidefinition.shared.data.Status;

public record UserRow(String name, String email, Status role) {
}
