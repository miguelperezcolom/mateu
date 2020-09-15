package io.mateu.mdd.core.model;

import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.model.population.YamlPopulator;
import io.mateu.mdd.shared.AppContext;
import io.mateu.mdd.util.Helper;

import java.io.InputStream;

public class BaseAppContext implements AppContext {
    @Override
    public void initialized() {

    }

    @Override
    public boolean needsPopulation() {
        try {
            return Helper.find(AppConfig.class, 1l) != null;
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
        return true;
    }

    @Override
    public void populate() throws Throwable {
        InputStream r = getClass().getResourceAsStream("/data/initialdata.yaml");
        if (r != null) {
            new YamlPopulator().populate(r);
        }
    }

    @Override
    public void destroyed() {

    }
}
