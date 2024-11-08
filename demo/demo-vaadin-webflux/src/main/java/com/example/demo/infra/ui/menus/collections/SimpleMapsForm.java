package com.example.demo.infra.ui.menus.collections;

import io.mateu.uidl.annotations.Caption;
import io.mateu.uidl.annotations.Section;
import lombok.Data;

import java.util.Map;

@Data
@Caption("Simple maps")
public class SimpleMapsForm {

  @Section("Simple maps")
  private Map<String, String> mapStringToString;

  private Map<String, Integer> mapStringToInt;

  private Map<String, Double> mapStringToDouble;
}
