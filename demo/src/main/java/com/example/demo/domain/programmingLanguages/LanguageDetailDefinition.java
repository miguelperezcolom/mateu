package com.example.demo.domain.programmingLanguages;

import io.mateu.core.domain.uidefinition.shared.annotations.Ignored;
import io.mateu.core.domain.uidefinition.shared.annotations.ReadOnly;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LanguageDetailDefinition {

  @Id @Ignored private String id;

  private String name;

  private LanguageRow.LanguageTarget target;
}
