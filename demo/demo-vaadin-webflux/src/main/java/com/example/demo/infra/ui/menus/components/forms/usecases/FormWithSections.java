package com.example.demo.infra.ui.menus.components.forms.usecases;

import io.mateu.uidl.annotations.ActionTarget;
import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.annotations.Section;

import java.time.LocalDate;

public class FormWithSections {

    @Section("Info")
    String name;
    int age;

    @Section("Address")
    String address;
    String city;
    String state;

    @Section("Fiscal data")
    String id;
    LocalDate registeredSince;

    @Section("Contact")
    String phone;
    String email;

    @MainAction(target = ActionTarget.Message)
    String assess() {
        return toString();
    }

    @Override
    public String toString() {
        return "FormWithSections{" +
                "name='" + name + '\'' +
                ", age=" + age +
                ", address='" + address + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", id='" + id + '\'' +
                ", registeredSince=" + registeredSince +
                ", phone='" + phone + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}
