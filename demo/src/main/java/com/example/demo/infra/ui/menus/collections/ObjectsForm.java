package com.example.demo.infra.ui.menus.collections;

import com.example.demo.domain.agnostic.pojos.Movie;
import com.example.demo.domain.agnostic.pojos.Profile;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.Section;
import lombok.Data;

@Data
@Caption("Objects")
public class ObjectsForm {

  @Section("Objects")
  private Profile profile = new Profile("Mateu", 14, Movie.JohnWick);

  private Profile emptyProfile;

}
