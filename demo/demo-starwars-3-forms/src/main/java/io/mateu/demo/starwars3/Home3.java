package io.mateu.demo.starwars3;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * The app shell: a menu to the two rich-form screens. {@code @App} with no value is AUTO, which for a
 * flat two-item menu renders as top tabs. Each {@code @Menu} field is a routed {@code @UI} class.
 */
@UI("")
@Title("Star Wars — rich forms")
@App
public class Home3 {

  @Menu RecruitWizard recruit;

  @Menu Dossier dossier;
}
