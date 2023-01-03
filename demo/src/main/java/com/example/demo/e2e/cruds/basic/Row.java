package com.example.demo.e2e.cruds.basic;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data@EqualsAndHashCode(of = "id")
@AllArgsConstructor
public class Row {

    private String id;

    private String name;

    private int age;

    @Override
    public String toString() {
        return id;
    }

}
