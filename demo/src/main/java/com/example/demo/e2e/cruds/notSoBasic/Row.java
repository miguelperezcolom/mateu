package com.example.demo.e2e.cruds.notSoBasic;

import io.mateu.reflection.ReflectionHelper;
import lombok.*;

@Data@EqualsAndHashCode(of = "id")
@AllArgsConstructor
@NoArgsConstructor
public class Row {

    private String id;

    private String name;

    private int age;

    public Row(String raw) {
        ReflectionHelper.copy(ReflectionHelper.fromXml(raw), this);
    }

    @Override
    public String toString() {
        return ReflectionHelper.toString(ReflectionHelper.toXml(this));
    }
}
