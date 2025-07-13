package com.example.demo.jsonschemabased;

import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Option;

import java.util.List;
import java.util.Map;

public class Mapper {

    public static FieldStereotype getStereotype(Map.Entry<String, Object> entry) {
        var property = (Map<String, Object>) entry.getValue();
        if (property.containsKey("enum")) {
            return FieldStereotype.combobox;
        }
        return FieldStereotype.regular;
    }

    public static List<Option> getOptions(Map.Entry<String, Object> entry) {
        var property = (Map<String, Object>) entry.getValue();
        if (property.containsKey("enum")) {
            return ((List) property.get("enum")).stream()
                    .map(value -> new Option("" + value, "" + value, ""))
                    .toList();
        }
        return List.of();
    }

    public static Object getInitialValue(Map.Entry<String, Object> entry) {
        var property = (Map<String, Object>) entry.getValue();
        return property.get("default");
    }

    public static FieldDataType getDataType(Map.Entry<String, Object> entry) {
        var property = (Map<String, Object>) entry.getValue();
        if (property.containsKey("type")) {
            String type = (String) property.get("type");
            if (type.equals("string")) {
                return FieldDataType.string;
            }
            if (type.equals("boolean")) {
                return FieldDataType.bool;
            }
            if (type.equals("integer")) {
                return FieldDataType.integer;
            }
        }
        return FieldDataType.string;
    }
}
