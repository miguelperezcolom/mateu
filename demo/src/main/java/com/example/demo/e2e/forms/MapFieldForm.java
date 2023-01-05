package com.example.demo.e2e.forms;

import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Output;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashMap;
import java.util.Map;

@Getter@Setter
public class MapFieldForm implements HasTitle {

    private Map<String, String> map = new LinkedHashMap<>();

    @Output
    private String assessment;

    @Action
    public void oneAction() {
        assessment = dump();
    }

    private String dump() {
        if (map == null) return "map is null";
        if (map.size() == 0) return "empty map";
        StringBuilder sb = new StringBuilder();
        sb.append("size = " + map.size());
        map.forEach((k,v) -> sb.append("," + k + "=" + v));
        return sb.toString();
    }

    @Override
    public String getTitle() {
        return "Form with a map field";
    }
}
