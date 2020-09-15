package io.mateu.showcase.domain;

import io.mateu.mdd.core.model.BaseAppContext;
import io.mateu.mdd.shared.AppContextListener;
import io.mateu.mdd.util.Helper;
import io.mateu.showcase.population.Holder;

import java.io.InputStream;

public class App extends BaseAppContext implements AppContextListener {

    public App() {

    }

    @Override
    public void populate() throws Throwable {

        super.populate();

        InputStream r = getClass().getResourceAsStream("/data/initialdata.yaml");
        if (r != null) {
            Holder data = Helper.fromYaml(Helper.leerFichero(r), Holder.class);
            data.persistAll();
        }

    }

}
