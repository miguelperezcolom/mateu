package io.mateu.mdd.core.model.authentication;

import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.persistence.JPATransaction;

import javax.persistence.EntityManager;
import java.util.function.Consumer;

public class UserCreatedEventConsumer implements Consumer<UserCreatedEvent> {
    @Override
    public void accept(UserCreatedEvent event) {
        try {
            Helper.transact(em -> em.find(User.class, event.getLogin()).sendWelcomeEmail());
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
    }
}
