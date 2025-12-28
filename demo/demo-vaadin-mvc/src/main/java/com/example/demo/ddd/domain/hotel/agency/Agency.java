package com.example.demo.ddd.domain.hotel.agency;

import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;
import io.mateu.uidl.annotations.NonEditable;

public record Agency(@NonEditable String id, String name) implements GenericEntity {
}
