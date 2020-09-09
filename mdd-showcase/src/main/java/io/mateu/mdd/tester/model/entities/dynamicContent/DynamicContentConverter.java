package io.mateu.mdd.tester.model.entities.dynamicContent;

import com.google.common.base.Strings;
import io.mateu.mdd.util.Helper;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.io.IOException;

@Converter
public class DynamicContentConverter implements AttributeConverter<DynamicContent, String> {


    @Override
    public String convertToDatabaseColumn(DynamicContent c) {
        String s = null;

        if (c != null) {
            s = c.getClass().getName();
            s += ",";
            try {
                s += Helper.toJson(c);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return s;
    }



    @Override
    public DynamicContent convertToEntityAttribute(String s) {
        DynamicContent c = null;
        if (!Strings.isNullOrEmpty(s)) {

            String className = s.substring(0, s.indexOf(","));
            String json = s.substring(s.indexOf(",") + 1);

            try {

                c = (DynamicContent) Helper.fromJson(json, Class.forName(className));

            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }


        }
        return c;
    }


}
