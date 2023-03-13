package io.mateu.mdd.shared.data;

import lombok.Getter;

@Getter
public class ExternalReference {

    private Object value;

    private String key;

    public ExternalReference(Object value, String key) {
        this.value = value;
        this.key = key;
    }

    @Override
    public String toString() {
        return "" + value +":'" + key + "'";
    }
}
