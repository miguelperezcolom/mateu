package org.example.application;

import io.mateu.lifecycle.BaseAppContextListener;
import io.mateu.mdd.core.annotations.AppListener;
import io.mateu.mdd.shared.AppContextListener;
import io.mateu.util.persistence.JPAHelper;
import org.example.application.population.Populator;
import org.example.domain.boundaries.educational.entities.AcademicPlan;


@AppListener
public class MyAppListener extends BaseAppContextListener implements AppContextListener {

    public MyAppListener() {

    }

    @Override
    public void registerEventConsumers() {

    }

    @Override
    public void populate() throws Throwable {

        super.populate();

        Populator.populateAll();

    }

    @Override
    public boolean isPopulationNeeded() {
        try {
            return JPAHelper.find(AcademicPlan.class, 1l) == null;
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
        return true;
    }
}
