package io.mateu.showcase.app;

import io.mateu.lifecycle.BaseAppContextListener;
import io.mateu.mdd.core.annotations.AppListener;
import io.mateu.mdd.core.model.authentication.UserCreatedEventConsumer;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.shared.AppContextListener;
import io.mateu.util.eventBus.EventBus;
import io.mateu.util.persistence.JPAHelper;
import org.example.application.population.Populator;


@AppListener
public class MyAppListener extends BaseAppContextListener implements AppContextListener {

    public MyAppListener() {

    }

    @Override
    public void registerEventConsumers() {
        EventBus.register(new UserCreatedEventConsumer());
    }

    @Override
    public void populate() throws Throwable {

        super.populate();

        Populator.populateAll();

    }

    @Override
    public boolean isPopulationNeeded() {
        try {
            return JPAHelper.find(AppConfig.class, 1l) == null;
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
        return true;
    }
}
