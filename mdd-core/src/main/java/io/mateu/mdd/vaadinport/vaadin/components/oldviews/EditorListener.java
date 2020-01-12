package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

public interface EditorListener {

    void preSave(Object model) throws Throwable;

    void onSave(Object model);

    void onGoBack(Object model);
}
