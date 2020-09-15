package io.mateu.showcase.domain;

import io.mateu.mdd.core.model.BaseAppContext;
import io.mateu.mdd.shared.AppContext;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.workflow.WorkflowEngine;
import io.mateu.showcase.domain.boundedContexts.educational.EducationalContextListener;
import io.mateu.showcase.domain.boundedContexts.financial.FinancialContextListener;
import io.mateu.showcase.population.Holder;

import java.io.InputStream;

public class App extends BaseAppContext implements AppContext {

    public App() {
        initialized();
    }

    @Override
    public void initialized() {
        super.initialized();

        new EducationalContextListener().contextInitialized();
        new FinancialContextListener().contextInitialized();
    }

    @Override

    public void populate() throws Throwable {

        InputStream r = getClass().getResourceAsStream("/data/initialdata.yaml");
        if (r != null) {
            //new YamlPopulator().populate(r);

            Holder data = Helper.fromYaml(Helper.leerFichero(r), Holder.class);

            //System.out.println(Helper.toJson(data));

            data.persistAll();

//            Helper.findAll(Grade.class).stream().forEach(g -> {
//                try {
//                    System.out.println(Helper.toJson(g));
//                } catch (IOException e) {
//                    e.printStackTrace();
//                }
//            });

        }

    }

    public static void main(String[] args) {
        try {
            new App().populate();
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        WorkflowEngine.exit(0);
    }
}
