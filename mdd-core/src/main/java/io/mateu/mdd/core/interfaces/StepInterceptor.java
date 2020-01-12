package io.mateu.mdd.core.interfaces;

public interface StepInterceptor {

    Object onEdit(String step) throws Throwable;
}
