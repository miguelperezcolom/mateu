package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReturnsBasic {

  String name;

  int age;

  @Action
  public String sayHello() {
    return "Hello " + name + ", aged " + age;
  }

  @Action
  public int showRating() {
    return 5;
  }

  @Action
  public double showRandom() {
    return Math.random();
  }
}
