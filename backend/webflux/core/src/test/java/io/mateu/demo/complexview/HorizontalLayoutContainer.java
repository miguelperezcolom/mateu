package io.mateu.demo.complexview;

import io.mateu.demo.SimpleForm;
import io.mateu.uidl.annotations.HorizontalLayouted;
import io.mateu.uidl.interfaces.Card;

@HorizontalLayouted
public class HorizontalLayoutContainer {

  Card simpleCard = new Card("Simple Card 4", "Subtitle 4", "Content 4");

  SimpleForm simpleForm;
}
