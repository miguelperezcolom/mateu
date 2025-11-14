package com.example.uis.travel;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.interfaces.HorizontalLayout;
import java.util.function.Supplier;

public class CustomerSelector implements HorizontalLayout {

  String id;

  String name;

  @Button Supplier<?> create = () -> new CreateCustomerForm();
}
