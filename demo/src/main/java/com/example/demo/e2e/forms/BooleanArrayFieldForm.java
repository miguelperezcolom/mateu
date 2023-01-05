package com.example.demo.e2e.forms;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Output;
import lombok.Getter;
import lombok.Setter;

import java.util.Arrays;

@Getter@Setter
public class BooleanArrayFieldForm {

    private boolean[] array;

    @Output
    private String assessment;

    @Action
    public void oneAction() {
        assessment = dump();
    }

    private String dump() {
        if (array == null) return "array is null";
        if (array.length == 0) return "empty array";
        return Arrays.toString(array);
    }

}
