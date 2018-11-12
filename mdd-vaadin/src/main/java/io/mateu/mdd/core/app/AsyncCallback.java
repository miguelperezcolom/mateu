package io.mateu.mdd.core.app;

/**
 * Created by miguel on 8/12/16.
 */
public interface AsyncCallback<T> {

    void onFailure(Throwable caught);

    void onSuccess(T result);

}
