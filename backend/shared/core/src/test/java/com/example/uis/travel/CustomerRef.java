package com.example.uis.travel;

import com.example.uis.travel.uidl.Button;
import com.example.uis.travel.uidl.HorizontalLayout;

import java.util.function.Supplier;

public class CustomerRef implements HorizontalLayout {

    String id;

    String name;

    @Button
    Supplier<?> create = () -> new CreateCustomerForm();
}
