package com.example.demo.infra.ui.menus.components.forms.fields.collections;

import com.example.demo.domain.agnostic.records.AddressRecord;
import com.example.demo.domain.nfl.providers.TeamsProvider;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ItemsProvider;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ExternalReference;
import lombok.Data;

import java.util.Map;

@Data
@Title("Complex maps")
public class ComplexMapsForm {

  @Section("Complex maps")
  private Map<String, AddressRecord> mapStringToObject;

  @ItemsProvider(TeamsProvider.class)
  private Map<String, ExternalReference> mapStringToExternalRef;
}
