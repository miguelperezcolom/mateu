package io.mateu.mdd.core.util;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {


    private static final String DELIMITADOR = "KKUYS451KK";

    @Override
    public String convertToDatabaseColumn(List<String> list) {
        if (list == null) return null;
        else {
            String s = "";
            for (String t : list) {
                if (!"".equals(s)) s += DELIMITADOR;
                s += t;
            }
            return s;
        }
    }

    @Override
    public List<String> convertToEntityAttribute(String s) {
        if (s == null) return null;
        else {
            List<String> list = new ArrayList<>();
            for (String t : s.split(DELIMITADOR)) list.add(t);
            return list;
        }
    }
}
