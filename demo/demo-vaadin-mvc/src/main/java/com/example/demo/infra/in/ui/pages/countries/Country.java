package com.example.demo.infra.in.ui.pages.countries;


import io.mateu.uidl.interfaces.Named;

public record Country(String code, String name) implements Named {
    @Override
    public String id() {
        return code;
    }
}
