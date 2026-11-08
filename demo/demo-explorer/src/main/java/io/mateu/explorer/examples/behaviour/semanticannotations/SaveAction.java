package io.mateu.explorer.examples.behaviour.semanticannotations;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Toolbar;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** A method one: the house "Save" — on the toolbar, validated, bound to Ctrl+Alt+S. */
@Toolbar
@Label("Save")
@Action(validationRequired = true, shortcut = "ctrl+alt+s")
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface SaveAction {}
