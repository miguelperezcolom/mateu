package io.mateu.demo.complexview;

import io.mateu.core.domain.uidefinition.core.interfaces.Card;
import io.mateu.core.domain.uidefinition.shared.annotations.HorizontalLayout;
import io.mateu.demo.SimpleForm;

@HorizontalLayout
public class HorizontalLayoutContainer {

    Card simpleCard = new Card("Simple Card 4", "Subtitle 4", "Content 4");

    SimpleForm simpleForm;

}
