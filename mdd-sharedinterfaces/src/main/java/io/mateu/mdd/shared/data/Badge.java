package io.mateu.mdd.shared.data;

import lombok.Getter;

@Getter
public class Badge {

    private BadgeType type;

    private String message;

    public Badge(BadgeType type, String message) {
        this.type = type;
        this.message = message;
    }
}
