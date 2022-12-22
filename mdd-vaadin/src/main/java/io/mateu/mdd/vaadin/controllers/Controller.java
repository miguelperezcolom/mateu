package io.mateu.mdd.vaadin.controllers;

import io.mateu.mdd.vaadin.navigation.ViewStack;

public abstract class Controller {

    public abstract Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable;

}
