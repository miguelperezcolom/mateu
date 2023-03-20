package io.mateu.mdd.shared.data;

import lombok.Getter;

@Getter
public class Destination {

    private final DestinationType type;

    private final String value;

    public Destination(DestinationType type, String value) {
        this.type = type;
        this.value = value;
    }

}
