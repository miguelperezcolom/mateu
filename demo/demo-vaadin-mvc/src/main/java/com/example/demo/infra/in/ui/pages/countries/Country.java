package com.example.demo.infra.in.ui.pages.countries;


import io.mateu.uidl.interfaces.Named;
import jakarta.validation.constraints.NotEmpty;

public record Country(@NotEmpty String code, @NotEmpty String name) implements Named {
    @Override
    public String id() {
        return code;
    }
}
