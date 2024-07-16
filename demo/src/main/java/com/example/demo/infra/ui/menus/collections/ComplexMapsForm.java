package com.example.demo.infra.ui.menus.collections;

import com.example.demo.domain.agnostic.records.AddressRecord;
import com.example.demo.domain.nfl.providers.TeamsProvider;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.ItemsProvider;
import io.mateu.mdd.shared.annotations.Section;
import io.mateu.mdd.shared.data.ExternalReference;
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
