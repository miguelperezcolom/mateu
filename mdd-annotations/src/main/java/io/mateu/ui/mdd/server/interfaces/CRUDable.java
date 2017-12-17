package io.mateu.ui.mdd.server.interfaces;

public interface CRUDable {

    public void load() throws Throwable;

    public void save() throws Throwable;

    public Search getSearch();
}
