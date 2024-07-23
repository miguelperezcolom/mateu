package com.example.demo.infra.ui.menus.collections;

import com.example.demo.domain.agnostic.records.AddressRecord;
import com.example.demo.domain.nfl.providers.TeamsProvider;
import io.mateu.domain.uidefinition.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.ItemsProvider;
import io.mateu.core.domain.uidefinition.shared.annotations.Section;
import io.mateu.core.domain.uidefinition.shared.data.ExternalReference;
import lombok.Data;

import java.util.Map;

@Data
@Caption("Complex maps")
public class ComplexMapsForm {

  @Section("Complex maps")
  private Map<String, AddressRecord> mapStringToObject;

  @ItemsProvider(TeamsProvider.class)
  private Map<String, ExternalReference> mapStringToExternalRef;
}
