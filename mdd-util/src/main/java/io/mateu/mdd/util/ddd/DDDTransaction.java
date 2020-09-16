package io.mateu.mdd.util.ddd;

public interface DDDTransaction {

    void run(DDDContext ctx) throws Throwable;

}
