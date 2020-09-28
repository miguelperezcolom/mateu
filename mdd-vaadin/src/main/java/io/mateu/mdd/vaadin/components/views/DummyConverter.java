package io.mateu.mdd.vaadin.components.views;

import com.vaadin.data.Converter;
import com.vaadin.data.Result;
import com.vaadin.data.ValueContext;

public class DummyConverter implements Converter {

    private final Object valueIfNull;

    public DummyConverter(Object valueIfNull) {
        this.valueIfNull = valueIfNull;
    }

    public DummyConverter() {
        this.valueIfNull = "";
    }

    @Override
    public Result convertToModel(Object o, ValueContext valueContext) {
        return Result.ok(o);
    }

    @Override
    public Object convertToPresentation(Object o, ValueContext valueContext) {
        return o != null?"" + o:valueIfNull;
    }

}
