package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentMetadataDto;
import io.mateu.dtos.ServerSideComponentDto;
import java.lang.reflect.RecordComponent;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import org.junit.jupiter.api.Test;

/**
 * Authoring ↔ wire parity guard (a RATCHET).
 *
 * <p>The invariant: every WIRE knob the frontend renders must be AUTHORABLE. Concretely, for each
 * concrete component metadata DTO ({@code implements ComponentMetadataDto}, enumerated from {@link
 * ComponentMetadataDto}'s {@code @JsonSubTypes}), every record component of that DTO must be
 * covered by an authoring counterpart — either:
 *
 * <ul>
 *   <li>a field of the paired authoring record ({@code <X>Dto} ↔ {@code <X>} in {@code
 *       io.mateu.uidl.data} or {@code io.mateu.uidl.fluent}, with {@link #RENAME_PAIRS} for the few
 *       naming exceptions),
 *   <li>a field carried on the ENVELOPE DTOs ({@link ServerSideComponentDto} / {@link
 *       ClientSideComponentDto} — {@code id}, {@code style}, {@code cssClasses}, {@code slot}, …
 *       are carried there, NOT on the per-component metadata DTO),
 *   <li>a {@link #FIELD_RENAMES} mapping (dto field name → record field name, e.g. {@code
 *       fieldId}→{@code id}), or
 *   <li>an explicit {@link #ALLOWLIST} entry (today's known holes, each tagged and commented).
 * </ul>
 *
 * <p>This is a ratchet: today's known holes are seeded into {@link #ALLOWLIST} so the test PASSES
 * now. A future regression — a NEW unmatched DTO field, or a DTO that loses its authoring record —
 * fails with a message that names it, so the gap is surfaced at the moment it is introduced.
 *
 * <p>Direction note: this test guards ONE direction (every wire field authorable). The opposite (an
 * authoring-record field that never reaches the wire, e.g. {@code FormField.min}/{@code max}) is
 * NOT flagged here — an unwired authoring knob is a no-op, not a rendered-but-unauthorable knob.
 */
class AuthoringWireParityGuardTest {

  /** DTO simple type name (minus {@code Dto}) → authoring record simple name, when they differ. */
  private static final Map<String, String> RENAME_PAIRS =
      Map.of(
          // The listing/CRUD wire DTO; its fluent authoring record is Listing.
          "Crudl", "Listing",
          // PageDto pairs with the fluent PageView, NOT the io.mateu.uidl.data.Page<T> pagination
          // record (which is same-named but unrelated — a page of rows).
          "Page", "PageView");

  /** DTO field name → authoring-record field name, for the handful the mappers rename. */
  private static final Map<String, String> FIELD_RENAMES =
      Map.of(
          // FieldMapper: .fieldId(formField.id())
          "fieldId", "id");

  /**
   * Today's known-uncovered DTO fields, keyed {@code "<DtoSimpleName>.<field>"}. Each is tagged
   * either DERIVED (the server computes it; it is never authored) or HOLE (a genuine authoring gap
   * to revisit). Keep this MINIMAL — a new entry here is a deliberate, reviewed decision.
   */
  private static final Set<String> ALLOWLIST =
      new LinkedHashSet<>(
          List.of(
              // ---- ResponsiveGridDto (authoring record: ResponsiveGrid) ----
              // DERIVED: the CSS grid-template-columns string, computed by the record's
              // gridTemplateColumns() accessor from the authored `columns` (List<GridTrack>) — the
              // author declares `columns`, the wire carries the rendered template.
              "ResponsiveGridDto.gridTemplateColumns",

              // ---- FormFieldDto ----
              // DERIVED: rules re-evaluation flag, computed from @Observed/rule wiring, never
              // authored on the field itself.
              "FormFieldDto.observed",
              // DERIVED: right-alignment for numeric/money cells, decided by the mapper from the
              // data type, not declared.
              "FormFieldDto.rightAligned",
              // DERIVED: bold rendering flag, mapper-decided, not declared.
              "FormFieldDto.bold",
              // DERIVED: header/inline badges, composed by the server (@Badge/@BadgeInHeader), not
              // a
              // FormField record field.
              "FormFieldDto.badges",

              // ---- CrudlDto (authoring record: Listing) ----
              // DERIVED: whether the Edit button shows — computed from the capability gates
              // (Editable/@NotEditable), not authored on the Listing record.
              "CrudlDto.canEdit",
              // DERIVED: the crud list type, resolved by the server from the listing/CRUD shape.
              "CrudlDto.crudlType",
              // DERIVED: "this crud is a child of another view" — set from nesting context.
              "CrudlDto.child",
              // DERIVED: an action-on-selected-row exists — computed from the declared toolbar/bulk
              // actions.
              "CrudlDto.hasActionOnSelectedRow",
              // DERIVED: multiple-row selection enabled — computed from capabilities (Deletable /
              // bulk actions).
              "CrudlDto.multipleRowSelectionEnabled",
              // DERIVED: a selection listener exists — computed from capabilities.
              "CrudlDto.selectionListened",
              // DERIVED: show-as-cards — resolved from the effective grid layout, not authored as a
              // flag.
              "CrudlDto.showCards",

              // ---- FormDto (authoring record: Form) ----
              // DERIVED: form icon, from page/form metadata context.
              "FormDto.icon",
              // DERIVED: read-only state, from the execution context (view mode / permissions).
              "FormDto.readOnly",
              // DERIVED: status band, server-composed.
              "FormDto.status",
              // DERIVED: header badges, composed from @BadgeInHeader / BadgeSupplier, not a Form
              // record field.
              "FormDto.badges",
              // DERIVED: page banners, composed from @Banner / BannerSupplier, not a Form record
              // field.
              "FormDto.banners",

              // ---- PageDto (authoring record: PageView) ----
              // DERIVED: page icon, from page metadata / favicon context.
              "PageDto.icon",
              // DERIVED: read-only state, from the execution context.
              "PageDto.readOnly",
              // DERIVED: status band, server-composed.
              "PageDto.status"));

  /**
   * DTOs with no paired authoring record (wire-only / server-derived envelope components). Their
   * fields are, by definition, not directly authored, so they are excluded from the field check —
   * but the SET is pinned so that a DTO GAINING or LOSING an authoring record is noticed.
   */
  private static final Set<String> DTOS_WITHOUT_AUTHORING_RECORD =
      new TreeSet<>(
          List.of(
              // The app shell — authored via @App/@Menu/@UI + AppSupplier/MenuSupplier, no single
              // authoring record; the wire DTO is composed by the app mapper.
              "AppDto",
              // The action-result page — server-composed from an action's outcome.
              "ResultDto",
              // The wizard stepper chrome — server-composed from the wizard's steps.
              "StepperDto"));

  @Test
  void everyWireDtoFieldIsAuthorable() {
    Set<String> envelope = new TreeSet<>();
    envelope.addAll(recordComponentNames(ServerSideComponentDto.class));
    envelope.addAll(recordComponentNames(ClientSideComponentDto.class));

    List<Class<?>> dtos = enumerateComponentMetadataDtos();

    // regressions we care about
    List<String> newUncovered = new ArrayList<>();
    List<String> newDtosWithoutRecord = new ArrayList<>();
    Set<String> stillWithoutRecord = new TreeSet<>();

    for (Class<?> dto : dtos) {
      String dtoName = dto.getSimpleName();
      Class<?> record = resolveAuthoringRecord(dtoName);
      if (record == null) {
        stillWithoutRecord.add(dtoName);
        if (!DTOS_WITHOUT_AUTHORING_RECORD.contains(dtoName)) {
          newDtosWithoutRecord.add(dtoName);
        }
        continue;
      }

      Set<String> authorable = new TreeSet<>(envelope);
      authorable.addAll(recordComponentNames(record));

      for (String dtoField : recordComponentNames(dto)) {
        String mapped = FIELD_RENAMES.getOrDefault(dtoField, dtoField);
        if (authorable.contains(mapped)) {
          continue;
        }
        String key = dtoName + "." + dtoField;
        if (!ALLOWLIST.contains(key)) {
          newUncovered.add(key + "  (paired record: " + record.getSimpleName() + ")");
        }
      }
    }

    StringBuilder msg = new StringBuilder();
    if (!newUncovered.isEmpty()) {
      msg.append(
              "\nNEW UNCOVERED WIRE DTO FIELD(S) — every wire knob the frontend renders must be authorable.\n")
          .append(
              "For each, either add the field to the paired authoring record, add a FIELD_RENAMES\n")
          .append(
              "entry if the mapper renames it, or add an ALLOWLIST entry tagged // DERIVED: (server\n")
          .append("computes it) or // HOLE: (a real authoring gap to revisit):\n");
      for (String u : newUncovered) {
        msg.append("  - ").append(u).append('\n');
      }
    }
    if (!newDtosWithoutRecord.isEmpty()) {
      msg.append(
          "\nNEW COMPONENT DTO(S) WITH NO AUTHORING RECORD — pair them with an authoring record\n"
              + "(add a RENAME_PAIRS entry if named differently) or, if genuinely wire-only, add them\n"
              + "to DTOS_WITHOUT_AUTHORING_RECORD:\n");
      for (String d : newDtosWithoutRecord) {
        msg.append("  - ").append(d).append('\n');
      }
    }

    assertThat(newUncovered).as(msg.toString()).isEmpty();
    assertThat(newDtosWithoutRecord).as(msg.toString()).isEmpty();

    // The set of DTOs without an authoring record must not shrink silently either: if a DTO
    // GAINS a record, remove it from DTOS_WITHOUT_AUTHORING_RECORD so it starts being
    // field-checked.
    assertThat(stillWithoutRecord)
        .as(
            "DTOS_WITHOUT_AUTHORING_RECORD lists DTOs that no longer lack a record; remove the stale\n"
                + "entries so they get field-checked. Expected still-without-record: %s",
            stillWithoutRecord)
        .isEqualTo(new TreeSet<>(DTOS_WITHOUT_AUTHORING_RECORD));
  }

  // --- helpers ---

  private static List<Class<?>> enumerateComponentMetadataDtos() {
    JsonSubTypes subTypes = ComponentMetadataDto.class.getAnnotation(JsonSubTypes.class);
    assertThat(subTypes)
        .as("ComponentMetadataDto must carry @JsonSubTypes as the DTO catalog")
        .isNotNull();
    // de-dup by class (a couple appear twice in the annotation) while keeping order stable.
    Map<String, Class<?>> byName = new TreeMap<>();
    for (JsonSubTypes.Type t : subTypes.value()) {
      byName.put(t.value().getSimpleName(), t.value());
    }
    return new ArrayList<>(byName.values());
  }

  private static Class<?> resolveAuthoringRecord(String dtoName) {
    String base = dtoName.endsWith("Dto") ? dtoName.substring(0, dtoName.length() - 3) : dtoName;
    String recordName = RENAME_PAIRS.getOrDefault(base, base);
    for (String pkg : List.of("io.mateu.uidl.data.", "io.mateu.uidl.fluent.")) {
      try {
        Class<?> c = Class.forName(pkg + recordName);
        if (c.isRecord()) {
          return c;
        }
      } catch (ClassNotFoundException ignored) {
        // try the next package
      }
    }
    return null;
  }

  private static Set<String> recordComponentNames(Class<?> c) {
    Set<String> names = new LinkedHashSet<>();
    if (c != null && c.isRecord()) {
      for (RecordComponent rc : c.getRecordComponents()) {
        names.add(rc.getName());
      }
    }
    return names;
  }
}
