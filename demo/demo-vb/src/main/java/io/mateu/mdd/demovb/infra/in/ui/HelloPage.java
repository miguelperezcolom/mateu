package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** Fase 1 (hola mundo): una Page con un texto — el primer nodo que pinta el renderer VB. */
@UI("/hello")
@Title("Hola")
@ReadOnly
public class HelloPage {

  String message = "Hola desde Mateu";
}
