package io.mateu.mdd.lifecycle;

import io.mateu.mdd.shared.AppContextListener;
import io.mateu.mdd.shared.BoundedContextListener;
import io.mateu.mdd.shared.Command;
import io.mateu.mdd.util.Helper;

import java.util.List;

public class BaseAppContextListener implements AppContextListener {

    public BaseAppContextListener() {
    }

    @Override
    public void init() {
    }


    @Override
    public void registerEventConsumers() {
    }

    @Override
    public void initialized() {
        try {
            Helper.getImpls(BoundedContextListener.class).stream().forEach(c -> c.contextInitialized());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public boolean isPopulationNeeded() {
       return false;
    }

    @Override
    public void populate() throws Throwable {
    }

    @Override
    public void destroyed() {
        System.out.println("app destroyed");
    }

    @Override
    public List<Command> getCommands() {
        return null;
    }

}
