package io.mateu.mdd.core.model.authentication;

import io.mateu.util.eventBus.Event;
import lombok.Getter;

@Getter
public class UserCreatedEvent implements Event {
    private final String login;

    public UserCreatedEvent(String login) {
        this.login = login;
    }
}
