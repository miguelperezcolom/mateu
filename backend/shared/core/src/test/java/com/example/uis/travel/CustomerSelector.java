package com.example.uis.travel;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ActionType;
import io.mateu.uidl.interfaces.HorizontalLayout;
import java.util.function.Supplier;

public class CustomerSelector implements HorizontalLayout {

  String id;

  String name;

  @Action(type = ActionType.Button)
  Supplier<?> create = () -> new CreateCustomerForm();
}
