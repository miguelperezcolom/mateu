package com.example.demoremote.ui.demoApp.menus.collections;

import com.example.demoremote.domains.agnostic.records.AddressRecord;
import com.example.demoremote.domains.nfl.providers.TeamsProvider;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.ItemsProvider;
import io.mateu.mdd.shared.annotations.Section;
import io.mateu.mdd.shared.data.ExternalReference;
import java.util.Map;
import lombok.Data;

@Data
@Caption("Complex maps")
public class ComplexMapsForm {

  @Section("Complex maps")
  private Map<String, AddressRecord> mapStringToObject;

  @ItemsProvider(TeamsProvider.class)
  private Map<String, ExternalReference> mapStringToExternalRef;
}
