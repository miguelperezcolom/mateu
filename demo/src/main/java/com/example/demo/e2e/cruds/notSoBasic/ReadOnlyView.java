package com.example.demo.e2e.cruds.notSoBasic;

import com.example.demo.e2e.dtos.SamplePojo;
import io.mateu.reflection.ReflectionHelper;
import lombok.Data;

import java.util.UUID;

@Data
public class ReadOnlyView implements Runnable {

    private String id = UUID.randomUUID().toString();

    private String name;

    // constructor from row needed for crud's "edit" functionality
    public ReadOnlyView(Row row) {
        id = row.getId();
        name = row.getName();
    }

    // empty constructor needed for crud's "new" functionality
    public ReadOnlyView() {
    }

    // the default action is to save it
    @Override
    public void run() {
        new Service().save(this);
    }
}
