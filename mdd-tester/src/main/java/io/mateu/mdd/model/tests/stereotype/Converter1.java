package io.mateu.mdd.model.tests.stereotype;

import io.mateu.ui.mdd.server.interfaces.Converter;

import java.util.List;

public class Converter1 implements Converter<String, Integer> {


    @Override
    public Integer load(String from) {
        return (from != null)?Integer.parseInt(from):null;
    }

    @Override
    public String save(Integer from) {
        return (from != null)?"" + from:null;
    }
}
