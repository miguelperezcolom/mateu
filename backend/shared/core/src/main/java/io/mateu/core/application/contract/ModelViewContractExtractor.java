package io.mateu.core.application.contract;

import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ComponentMetadataDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.ModelViewContractDto;
import io.mateu.dtos.ServerSideComponentDto;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

/**
 * Derives a {@link ModelViewContractDto} — a ModelView's bindable fields and actions — from the
 * component the reflective mapper actually produced for it. Because it reads the SAME mapped output
 * the frontend renders, the contract can never drift from what the UI really binds: a field appears
 * in the contract iff a {@code FormField} for it is emitted, with the very {@code dataType} and
 * {@code stereotype} the renderer would use; an action appears iff it is advertised on the wire.
 *
 * <p>Phase 1 of the visual builder: this is the single source of truth the WYSIWYG plugin / codegen
 * validate a YAML or visual layout against (does this {@code id} exist? is this {@code actionId}
 * real? which widget fits this type?). Pure over the DTO tree — the caller supplies the mapped
 * component (e.g. from a normal sync of the ModelView).
 */
public final class ModelViewContractExtractor {

  private ModelViewContractExtractor() {}

  public static ModelViewContractDto extract(ServerSideComponentDto component) {
    if (component == null) {
      return new ModelViewContractDto(null, List.of(), List.of());
    }
    var formFields = new ArrayList<FormFieldDto>();
    walk(component, FormFieldDto.class, formFields);

    // De-dup by id, keeping declaration order (a field id is unique on a form).
    var byId = new LinkedHashMap<String, ModelViewContractDto.Field>();
    for (var f : formFields) {
      if (f.fieldId() == null || byId.containsKey(f.fieldId())) {
        continue;
      }
      byId.put(
          f.fieldId(),
          new ModelViewContractDto.Field(
              f.fieldId(), f.dataType(), f.stereotype(), f.label(), f.required(), f.readOnly()));
    }

    List<ModelViewContractDto.Action> actions =
        component.actions() == null
            ? List.of()
            : component.actions().stream()
                .map(ActionDto::id)
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .map(ModelViewContractDto.Action::new)
                .toList();

    return new ModelViewContractDto(
        component.serverSideType(), List.copyOf(byId.values()), actions);
  }

  // Reflective walk of the DTO tree — form fields nest inside component METADATA records, so a
  // plain
  // children walk misses them (same shape the wire walkers use elsewhere).
  private static <T> void walk(Object node, Class<T> type, List<T> found) {
    if (node == null) {
      return;
    }
    if (node instanceof ClientSideComponentDto client) {
      if (client.metadata() != null) {
        if (type.isInstance(client.metadata())) {
          found.add(type.cast(client.metadata()));
        }
        walkMetadata(client.metadata(), type, found);
      }
      if (client.children() != null) {
        client.children().forEach(child -> walk(child, type, found));
      }
    } else if (node instanceof ServerSideComponentDto server) {
      if (server.children() != null) {
        server.children().forEach(child -> walk(child, type, found));
      }
    }
  }

  private static <T> void walkMetadata(
      ComponentMetadataDto metadata, Class<T> type, List<T> found) {
    if (!metadata.getClass().isRecord()) {
      return;
    }
    for (var recordComponent : metadata.getClass().getRecordComponents()) {
      Object value;
      try {
        value = recordComponent.getAccessor().invoke(metadata);
      } catch (ReflectiveOperationException e) {
        continue; // a metadata accessor we can't read is not worth failing the whole extraction
      }
      if (value instanceof ComponentDto dto) {
        walk(dto, type, found);
      } else if (value instanceof List<?> list) {
        list.forEach(
            item -> {
              if (item instanceof ComponentDto dto) {
                walk(dto, type, found);
              }
            });
      }
    }
  }
}
