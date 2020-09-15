package io.mateu.showcase.domain;

import io.mateu.mdd.core.model.BaseAppContext;
import io.mateu.mdd.shared.AppContextListener;
import io.mateu.mdd.shared.Command;
import io.mateu.mdd.shared.ScheduledCommand;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.workflow.WorkflowEngine;
import io.mateu.showcase.population.Holder;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;

public class App extends BaseAppContext implements AppContextListener {

    public App() {
        init();
        initialized();
    }

    @Override
    public List<Command> getCommands() {
        return List.of(new ScheduledCommand() {
            @Override
            public String getSchedule() {
                //"0 0/2 8-17 * * ?"
                // segundos minutos horas dia-del-mes mes dia-semana año(opcional)
                return "0/6 * * * * ?"; // cada cada 6 segundos (0,6,12,18,24,30,36,42,48,54)
            }

            @Override
            public void run() {
                System.out.println("command run! " + LocalDateTime.now());
            }
        });
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

    public static void main(String[] args) {
        try {
            new App().populate();
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        try {
            Thread.sleep(5 * 60 * 1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        WorkflowEngine.exit(0);
    }
}
