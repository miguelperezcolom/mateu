package io.mateu.mdd.shared.interfaces;

import java.util.List;

public abstract class ComplexKeyChoice {

    private ComplexKeyOption value;

    public ComplexKeyOption getValue() {
        return value;
    }

    public void setValue(ComplexKeyOption value) {
        this.value = value;
    }

    public abstract List<ComplexKeyOption> getOptions();


}
