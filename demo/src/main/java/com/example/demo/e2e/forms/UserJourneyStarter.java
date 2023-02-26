package com.example.demo.e2e.forms;

import io.mateu.mdd.core.app.MDDOpenUserJourneyAction;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.interfaces.Choice;
import io.mateu.mdd.shared.interfaces.Option;
import io.mateu.mdd.shared.interfaces.UserJourney;
import io.mateu.mdd.vaadin.views.UserJourneyHelper;
import io.mateu.util.notification.Notifier;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.concurrent.Callable;

public class UserJourneyStarter {

    private final String baseUrl;

    public UserJourneyStarter(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    @NotNull
    private Choice process = new Choice() {
        @Override
        public List<Option> getOptions() {
            try {
                return UserJourneyHelper.getProcessTypes(baseUrl);
            } catch (Exception e) {
                Notifier.alert(e);
                return List.of();
            }
        }
    };

    public Choice getProcess() {
        return process;
    }

    public void setProcess(Choice process) {
        this.process = process;
    }

    @MainAction
    public MDDOpenUserJourneyAction startJourney() throws Exception {
        //if (process.getValue() == null) throw  new Exception("You must select a valid process definition");
        return new MDDOpenUserJourneyAction((String) process.getValue().getCaption(), new UserJourney(baseUrl, (String) process.getValue().getValue()));
    }
}
