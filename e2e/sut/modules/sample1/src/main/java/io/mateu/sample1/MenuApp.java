package io.mateu.sample1;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

@UI("/app")
@Title("Menu App")
public class MenuApp {

    @Menu
    Section1 section1;

    @Menu
    Section2 section2;

}
