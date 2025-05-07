package com.example.uis.travel;

import com.example.uis.travel.uidl.Action;
import com.example.uis.travel.uidl.ActionType;
import com.example.uis.travel.uidl.HorizontalLayout;

import java.util.function.Supplier;

public class CustomerSelector implements HorizontalLayout {

    String id;

    String name;

    @Action(type = ActionType.Button)
    Supplier<?> create = () -> new CreateCustomerForm();

}
