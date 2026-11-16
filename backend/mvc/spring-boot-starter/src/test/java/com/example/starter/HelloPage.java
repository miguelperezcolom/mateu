package com.example.starter;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** The smallest Mateu screen: a form with one field, served at {@code /hello}. */
@UI("/hello")
@Title("Hello from the starter")
public class HelloPage {

  String name = "Mateu";
}
