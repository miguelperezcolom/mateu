package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.uidl.annotations.BadgeInHeader;
import io.mateu.uidl.annotations.Composition;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.HiddenInCreate;
import io.mateu.uidl.annotations.HiddenInEditor;
import io.mateu.uidl.annotations.HiddenInView;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.interfaces.CompositionCrudRepository;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Named;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.lang.reflect.Field;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;

/**
 * {@link FormFieldFilter} is the single gate deciding which fields make it into a rendered form, so
 * every branch (supplier, security, marker annotations, special types) is covered here.
 */
class FormFieldFilterTest {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  // ── fixtures ───────────────────────────────────────────────────────────────

  static class Line implements Named {
    public String id() {
      return "1";
    }

    public String name() {
      return "line";
    }
  }

  static class LineRepository implements CompositionCrudRepository<Line, String> {
    public Optional<Line> findById(String id) {
      return Optional.empty();
    }

    public String save(Line entity) {
      return "1";
    }

    public List<Line> findAll() {
      return List.of();
    }

    public void deleteAllById(List<String> selectedIds) {}

    public ListingData<Line> search(
        String searchText, Line filters, String parentId, Pageable pageable) {
      return null;
    }
  }

  @SuppressWarnings("unused")
  static class SampleForm {
    String plain;

    @Hidden String hidden;

    @KPI double revenue;

    @BadgeInHeader(label = "VIP")
    boolean vip;

    @Menu String menuEntry;

    Status status;

    @EyesOnly(roles = "admin")
    String secret;

    @Composition(
        targetClass = Line.class,
        repositoryClass = LineRepository.class,
        foreignKeyField = "parentId")
    List<Line> lines;

    @HiddenInView String editableOnly;

    @HiddenInCreate String notWhenCreating;

    @HiddenInEditor String readOnlyOnly;
  }

  static class SupplierForm extends SampleForm implements VisibilitySupplier {
    @Override
    public boolean isHidden(String memberName, HttpRequest httpRequest) {
      return "plain".equals(memberName);
    }
  }

  private static Field field(String name) throws Exception {
    return SampleForm.class.getDeclaredField(name);
  }

  private static boolean visible(String fieldName) throws Exception {
    return FormFieldFilter.filterField(field(fieldName), false, false, new SampleForm(), null);
  }

  private static HttpRequest requestWithRoles(String... roles) throws Exception {
    var claims = Map.of("realm_access", Map.of("roles", List.of(roles)));
    String jwt =
        "h."
            + Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(MAPPER.writeValueAsBytes(claims))
            + ".s";
    HttpRequest req = mock(HttpRequest.class);
    when(req.getHeaderValue("Authorization")).thenReturn("Bearer " + jwt);
    return req;
  }

  // ── plain fields and marker annotations ────────────────────────────────────

  @Test
  void plainFieldIsVisible() throws Exception {
    assertThat(visible("plain")).isTrue();
  }

  @Test
  void hiddenFieldIsExcluded() throws Exception {
    assertThat(visible("hidden")).isFalse();
  }

  @Test
  void kpiFieldIsExcludedFromFormBody() throws Exception {
    assertThat(visible("revenue")).isFalse();
  }

  @Test
  void badgeInHeaderFieldIsExcludedFromFormBody() throws Exception {
    assertThat(visible("vip")).isFalse();
  }

  @Test
  void menuFieldIsExcluded() throws Exception {
    assertThat(visible("menuEntry")).isFalse();
  }

  @Test
  void statusTypedFieldIsExcluded() throws Exception {
    assertThat(visible("status")).isFalse();
  }

  // ── VisibilitySupplier ─────────────────────────────────────────────────────

  @Test
  void visibilitySupplierCanHideAnyField() throws Exception {
    var form = new SupplierForm();
    assertThat(FormFieldFilter.filterField(field("plain"), false, false, form, null)).isFalse();
    // fields it does not hide keep the default behaviour
    assertThat(FormFieldFilter.filterField(field("editableOnly"), false, false, form, null))
        .isTrue();
  }

  // ── @EyesOnly security gate ────────────────────────────────────────────────

  @Test
  void eyesOnlyFieldIsHiddenWithoutToken() throws Exception {
    assertThat(visible("secret")).isFalse();
  }

  @Test
  void eyesOnlyFieldIsVisibleForAuthorizedRole() throws Exception {
    var admin = requestWithRoles("admin");
    assertThat(FormFieldFilter.filterField(field("secret"), false, false, new SampleForm(), admin))
        .isTrue();
    var user = requestWithRoles("user");
    assertThat(FormFieldFilter.filterField(field("secret"), false, false, new SampleForm(), user))
        .isFalse();
  }

  // ── @Composition collections: only shown in read-only (view) mode ──────────

  @Test
  void compositionCollectionOnlyVisibleInReadOnlyMode() throws Exception {
    assertThat(FormFieldFilter.filterField(field("lines"), false, true, new SampleForm(), null))
        .isTrue();
    assertThat(FormFieldFilter.filterField(field("lines"), false, false, new SampleForm(), null))
        .isFalse();
  }

  // ── view/editor/create-specific hiding ─────────────────────────────────────

  @Test
  void hiddenInViewOnlyAffectsViewMode() throws Exception {
    assertThat(FormFieldFilter.hiddenInView(field("editableOnly"))).isTrue();
    assertThat(FormFieldFilter.hiddenInView(field("plain"))).isFalse();
  }

  @Test
  void hiddenInCreateAndEditorAreModeSpecific() throws Exception {
    assertThat(FormFieldFilter.hiddenInEditor(field("notWhenCreating"), true)).isTrue();
    assertThat(FormFieldFilter.hiddenInEditor(field("notWhenCreating"), false)).isFalse();
    assertThat(FormFieldFilter.hiddenInEditor(field("readOnlyOnly"), false)).isTrue();
    assertThat(FormFieldFilter.hiddenInEditor(field("readOnlyOnly"), true)).isFalse();
  }
}
