package com.example.demo.infra.in.ui.pages.countries;


import io.mateu.uidl.interfaces.SimpleEntity;

public record Country(String code, String name) implements SimpleEntity {
    @Override
    public String id() {
        return code;
    }
}
