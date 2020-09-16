package io.mateu.showcase.domain;

import io.mateu.mdd.core.annotations.AppListener;
import io.mateu.mdd.core.model.BaseAppContextListener;
import io.mateu.mdd.shared.AppContextListener;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.JPAHelper;
import io.mateu.showcase.population.Holder;

import java.io.InputStream;


@AppListener
public class MyAppListener extends BaseAppContextListener implements AppContextListener {

    public MyAppListener() {

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
