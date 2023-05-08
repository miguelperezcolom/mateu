package io.mateu.mdd.shared.data;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data@NoArgsConstructor@EqualsAndHashCode(of = "value")
public class ExternalReference {

    private Object value;

    private String key;

    public ExternalReference(Object value, String key) {
        this.value = value;
        this.key = key;
    }

    @Override
    public String toString() {
        return key;
    }
}
