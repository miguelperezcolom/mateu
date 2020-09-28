package io.mateu.mdd.core.app;


import io.mateu.mdd.core.MDD;
import io.mateu.util.notification.Notifier;

/**
 * Created by miguel on 30/12/16.
 */
public class Callback<T> implements AsyncCallback<T> {
    @Override
    public void onFailure(Throwable caught) {
        Notifier.alert("ERROR: " + caught.getClass().getName() + ((caught.getMessage() != null)?":" + caught.getMessage():""));
    }

    @Override
    public void onSuccess(T result) {
        Notifier.info("Done!");
    }
}
