package io.mateu.mdd.tester.model.useCases.pojos;

import io.mateu.mdd.core.annotations.TextArea;
import io.mateu.mdd.util.Helper;
import lombok.Getter;

@Getter
public class Calculator {

    @TextArea
    private String operations;

    public void setOperations(String operations) {
        this.operations = operations;
        result = Helper.eval(operations);
    }

    private String result;

}
