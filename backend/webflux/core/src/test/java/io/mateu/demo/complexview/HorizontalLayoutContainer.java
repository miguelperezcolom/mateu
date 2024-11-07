package io.mateu.demo.complexview;

import io.mateu.demo.SimpleForm;
import io.mateu.uidl.core.annotations.HorizontalLayout;
import io.mateu.uidl.core.interfaces.Card;

@HorizontalLayout
public class HorizontalLayoutContainer {

  Card simpleCard = new Card("Simple Card 4", "Subtitle 4", "Content 4");

  SimpleForm simpleForm;
}
