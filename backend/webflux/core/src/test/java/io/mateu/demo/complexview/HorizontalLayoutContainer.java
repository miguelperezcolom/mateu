package io.mateu.demo.complexview;

import io.mateu.demo.SimpleForm;
import io.mateu.uidl.annotations.HorizontalLayout;
import io.mateu.uidl.interfaces.Card;

@HorizontalLayout
public class HorizontalLayoutContainer {

  Card simpleCard = new Card("Simple Card 4", "Subtitle 4", "Content 4");

  SimpleForm simpleForm;
}
