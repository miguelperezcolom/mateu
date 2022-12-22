package io.mateu.mdd.vaadin.controllers;

import io.mateu.mdd.vaadin.navigation.ViewStack;

public class VoidController extends Controller {

    @Override
    public Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
        return null;
    }
}
