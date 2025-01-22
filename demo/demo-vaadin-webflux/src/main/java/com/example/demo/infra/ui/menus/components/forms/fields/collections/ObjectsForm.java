package com.example.demo.infra.ui.menus.components.forms.fields.collections;

import com.example.demo.domain.agnostic.pojos.Movie;
import com.example.demo.domain.agnostic.pojos.Profile;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import lombok.Data;

@Data
@Title("Objects")
public class ObjectsForm {

  @Section("Objects")
  private Profile profile = new Profile("Mateu", 14, Movie.JohnWick);

  private Profile emptyProfile;

}
