package com.example.demoremote.ui.demoApp.menus.collections;

import com.example.demoremote.domains.agnostic.pojos.Movie;
import com.example.demoremote.domains.agnostic.pojos.Profile;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.Embed;
import io.mateu.mdd.shared.annotations.Section;
import lombok.Data;

@Data
@Caption("Objects")
public class ObjectsForm {

  @Section("Objects")
  private Profile profile = new Profile("Mateu", 14, Movie.JohnWick);

  private Profile emptyProfile;

  @Embed private Profile embeddedProfile;
}
