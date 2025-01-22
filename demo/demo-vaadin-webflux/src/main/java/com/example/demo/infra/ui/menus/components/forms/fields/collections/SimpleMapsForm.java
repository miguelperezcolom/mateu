package com.example.demo.infra.ui.menus.components.forms.fields.collections;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import lombok.Data;

import java.util.Map;

@Data
@Title("Simple maps")
public class SimpleMapsForm {

  @Section("Simple maps")
  private Map<String, String> mapStringToString;

  private Map<String, Integer> mapStringToInt;

  private Map<String, Double> mapStringToDouble;
}
