package io.mateu.util.ddd;

public interface DDDTransaction {

    void run(DDDContext ctx) throws Throwable;

}
