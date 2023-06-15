package com.example.demoremote.ui.demoApp.menus.collections;

import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.Section;
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
