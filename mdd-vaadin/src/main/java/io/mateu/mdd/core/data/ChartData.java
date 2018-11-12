package io.mateu.mdd.core.data;

import lombok.Getter;
import lombok.Setter;
import io.mateu.mdd.core.reflection.FieldInterfaced;

import java.util.ArrayList;
import java.util.List;

@Getter@Setter
public class ChartData {

    private final FieldInterfaced field;

    private String title;

    private List<ChartValue> values = new ArrayList<>();

    public ChartData(FieldInterfaced field, String title, List<ChartValue> values) {
        this.field = field;
        this.title = title;
        this.values = values;
    }
}
