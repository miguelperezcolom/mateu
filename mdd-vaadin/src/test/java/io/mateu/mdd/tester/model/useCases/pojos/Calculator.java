package io.mateu.mdd.tester.model.useCases.pojos;

import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.annotations.TextArea;
import io.mateu.mdd.core.util.Helper;
import lombok.Getter;
import lombok.Setter;

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
