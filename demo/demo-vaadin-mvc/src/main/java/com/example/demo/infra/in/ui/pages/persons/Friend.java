package com.example.demo.infra.in.ui.pages.persons;

import jakarta.validation.constraints.NotEmpty;

public record Friend(@NotEmpty String name, int age) {
}
