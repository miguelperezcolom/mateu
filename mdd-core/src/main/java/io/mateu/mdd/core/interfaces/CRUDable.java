package io.mateu.mdd.core.interfaces;

public interface CRUDable {

    public void load() throws Throwable;

    public void save() throws Throwable;

    public Search getSearch();
}
