package io.mateu.mdd.core.views;

import lombok.Getter;
import lombok.Setter;

import java.util.HashMap;
import java.util.Map;

@Getter@Setter
public class ExtraFilters {

    private final String ql;
    private final Map<String, Object> parameters;

    public ExtraFilters(String ql, Object... params) {
        this.ql = ql;
        this.parameters = new HashMap<>();
        String n = null;
        for (int i = 0; i < params.length; i++) {
            if (i % 2 == 0) n = (String) params[i];
            else parameters.put(n, params[i]);
        }
    }
}
