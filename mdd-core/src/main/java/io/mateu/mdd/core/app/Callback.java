package io.mateu.mdd.core.app;


import io.mateu.mdd.core.MDD;

/**
 * Created by miguel on 30/12/16.
 */
public class Callback<T> implements AsyncCallback<T> {
    @Override
    public void onFailure(Throwable caught) {
        MDD.alert("ERROR: " + caught.getClass().getName() + ((caught.getMessage() != null)?":" + caught.getMessage():""));
    }

    @Override
    public void onSuccess(T result) {
        MDD.alert("Done!");
    }
}
