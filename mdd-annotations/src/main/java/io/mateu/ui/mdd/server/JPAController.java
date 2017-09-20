package io.mateu.ui.mdd.server;

/**
 * Created by miguel on 11/1/17.
 */
public class JPAController extends JPAServerSideEditorViewController {
    @Override
    public Class getModelClass() {
        return null;
    }

    @Override
    public String getKey() {
        return "jpa";
    }
}
