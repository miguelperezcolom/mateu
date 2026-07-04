package io.mateu.core.domain.out.fragmentmapper.mappers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.dtos.RuleActionDto;
import io.mateu.dtos.RuleDto;
import io.mateu.dtos.RuleFieldAttributeDto;
import io.mateu.dtos.RuleResultDto;
import io.mateu.uidl.annotations.Disabled;
import io.mateu.uidl.annotations.DisabledUnless;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Rule;
import io.mateu.uidl.data.RuleAction;
import io.mateu.uidl.data.RuleFieldAttribute;
import io.mateu.uidl.data.RuleResult;
import io.mateu.uidl.interfaces.DisabledSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RuleSupplier;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * {@link RuleMapper} turns annotations ({@code @Rule}, {@code @Disabled}, {@code @DisabledUnless},
 * {@code @Hidden}) and runtime suppliers ({@link DisabledSupplier}, {@link RuleSupplier}) into the
 * client-side reactive rules shipped to the frontend, so every source branch of {@code createRules}
 * plus the DTO mapping is covered here.
 */
class RuleMapperTest {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  // ── fixtures ───────────────────────────────────────────────────────────────

  /** Semantic (composed) annotation wrapping {@code @Disabled}. */
  @Disabled
  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
  @interface Locked {}

  @SuppressWarnings("unused")
  @Rule(
      filter = "state.total > 100",
      action = RuleAction.SetDataValue,
      fieldName = "discount",
      fieldAttribute = RuleFieldAttribute.hidden,
      value = "",
      expression = "false",
      actionId = "",
      result = RuleResult.Continue)
  static class ClassRuleForm {
    String discount;
  }

  @SuppressWarnings("unused")
  static class DisabledForm {
    @Disabled String frozen;
    @Locked String composed;
    String free;
  }

  @SuppressWarnings("unused")
  static class DisabledUnlessForm {
    @DisabledUnless(roles = "admin")
    String adminOnly;
  }

  @SuppressWarnings("unused")
  static class HiddenForm {
    @Hidden String unconditionallyHidden; // empty expression → no rule (FormFieldFilter's job)

    @Hidden("state.type == 'basic'")
    String conditional;

    @Hidden("state.done")
    public void archive() {}

    public void visibleAction() {}
  }

  @SuppressWarnings("unused")
  static class SupplierDisabledForm implements DisabledSupplier {
    String alpha;
    String beta;

    @Override
    public boolean isDisabled(String memberName, HttpRequest httpRequest) {
      return "alpha".equals(memberName);
    }
  }

  static class RuleSupplierForm implements RuleSupplier {
    @Override
    public List<io.mateu.uidl.data.Rule> rules() {
      return List.of(
          io.mateu.uidl.data.Rule.builder()
              .filter("state.qty > 5")
              .action(RuleAction.SetStateValue)
              .fieldName("price")
              .fieldAttribute(RuleFieldAttribute.required)
              .value("0")
              .expression("true")
              .actionId("recalculate")
              .result(RuleResult.Stop)
              .build());
    }
  }

  @SuppressWarnings("unused")
  static class Row {
    @Disabled String qty;

    @Hidden("state.hideCol")
    String col;

    String plain;
  }

  @SuppressWarnings("unused")
  static class ListForm {
    List<Row> rows;
  }

  static class EmptyForm {}

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

  // ── class-level @Rule ──────────────────────────────────────────────────────

  @Test
  void classLevelRuleAnnotationIsMapped() {
    var rules = RuleMapper.createRules(new ClassRuleForm(), null);

    // note: createRules currently appends class-level @Rule twice (start + end of the method)
    assertThat(rules).hasSize(2);
    var rule = rules.get(0);
    assertThat(rule.filter()).isEqualTo("state.total > 100");
    assertThat(rule.action()).isEqualTo(RuleAction.SetDataValue);
    assertThat(rule.fieldName()).isEqualTo("discount");
    assertThat(rule.fieldAttribute()).isEqualTo(RuleFieldAttribute.hidden);
    assertThat(rule.expression()).isEqualTo("false");
    assertThat(rule.result()).isEqualTo(RuleResult.Continue);
    assertThat(rules.get(1)).isEqualTo(rule);
  }

  @Test
  void noAnnotationsYieldNoRules() {
    assertThat(RuleMapper.createRules(new EmptyForm(), null)).isEmpty();
  }

  // ── @Disabled ──────────────────────────────────────────────────────────────

  @Test
  void disabledFieldEmitsAlwaysOnDisabledRule() {
    var rules = RuleMapper.createRules(new DisabledForm(), null);

    assertThat(rules).hasSize(2); // frozen + composed, never free
    var rule = rules.stream().filter(r -> "frozen".equals(r.fieldName())).findFirst().orElseThrow();
    assertThat(rule.filter()).isEqualTo("true");
    assertThat(rule.action()).isEqualTo(RuleAction.SetDataValue);
    assertThat(rule.fieldAttribute()).isEqualTo(RuleFieldAttribute.disabled);
    assertThat(rule.expression()).isEqualTo("true");
    assertThat(rule.result()).isEqualTo(RuleResult.Continue);
  }

  @Test
  void composedDisabledAnnotationIsResolvedViaMetaAnnotations() {
    var rules = RuleMapper.createRules(new DisabledForm(), null);

    assertThat(rules)
        .anySatisfy(
            rule -> {
              assertThat(rule.fieldName()).isEqualTo("composed");
              assertThat(rule.fieldAttribute()).isEqualTo(RuleFieldAttribute.disabled);
            });
  }

  // ── @DisabledUnless ────────────────────────────────────────────────────────

  @Test
  void disabledUnlessEmitsDisabledRuleWhenUnauthorized() throws Exception {
    var withoutToken = RuleMapper.createRules(new DisabledUnlessForm(), null);
    var wrongRole = RuleMapper.createRules(new DisabledUnlessForm(), requestWithRoles("staff"));

    for (var rules : List.of(withoutToken, wrongRole)) {
      assertThat(rules).hasSize(1);
      assertThat(rules.get(0).fieldName()).isEqualTo("adminOnly");
      assertThat(rules.get(0).fieldAttribute()).isEqualTo(RuleFieldAttribute.disabled);
      assertThat(rules.get(0).expression()).isEqualTo("true");
    }
  }

  @Test
  void disabledUnlessEmitsNoRuleWhenAuthorized() throws Exception {
    var rules = RuleMapper.createRules(new DisabledUnlessForm(), requestWithRoles("admin"));

    assertThat(rules).isEmpty();
  }

  // ── DisabledSupplier ───────────────────────────────────────────────────────

  @Test
  void disabledSupplierDrivesPerFieldDisabledRules() {
    var rules = RuleMapper.createRules(new SupplierDisabledForm(), null);

    assertThat(rules).hasSize(1);
    assertThat(rules.get(0).fieldName()).isEqualTo("alpha");
    assertThat(rules.get(0).fieldAttribute()).isEqualTo(RuleFieldAttribute.disabled);
  }

  // ── @Hidden ────────────────────────────────────────────────────────────────

  @Test
  void hiddenWithExpressionEmitsHiddenRuleForFieldsAndMethods() {
    var rules = RuleMapper.createRules(new HiddenForm(), null);

    assertThat(rules).hasSize(2);
    var fieldRule =
        rules.stream().filter(r -> "conditional".equals(r.fieldName())).findFirst().orElseThrow();
    assertThat(fieldRule.fieldAttribute()).isEqualTo(RuleFieldAttribute.hidden);
    assertThat(fieldRule.expression()).isEqualTo("state.type == 'basic'");
    var methodRule =
        rules.stream().filter(r -> "archive".equals(r.fieldName())).findFirst().orElseThrow();
    assertThat(methodRule.fieldAttribute()).isEqualTo(RuleFieldAttribute.hidden);
    assertThat(methodRule.expression()).isEqualTo("state.done");
  }

  @Test
  void hiddenWithoutExpressionEmitsNoRule() {
    var rules = RuleMapper.createRules(new HiddenForm(), null);

    assertThat(rules).noneMatch(rule -> "unconditionallyHidden".equals(rule.fieldName()));
  }

  // ── list (grid) fields ─────────────────────────────────────────────────────

  @Test
  void listFieldRowAnnotationsEmitPrefixedRules() {
    var rules = RuleMapper.createRules(new ListForm(), null);

    assertThat(rules).hasSize(2);
    assertThat(rules)
        .anySatisfy(
            rule -> {
              assertThat(rule.fieldName()).isEqualTo("rows-qty");
              assertThat(rule.fieldAttribute()).isEqualTo(RuleFieldAttribute.disabled);
              assertThat(rule.expression()).isEqualTo("true");
            });
    assertThat(rules)
        .anySatisfy(
            rule -> {
              assertThat(rule.fieldName()).isEqualTo("rows-col");
              assertThat(rule.fieldAttribute()).isEqualTo(RuleFieldAttribute.hidden);
              assertThat(rule.expression()).isEqualTo("state.hideCol");
            });
  }

  // ── RuleSupplier ───────────────────────────────────────────────────────────

  @Test
  void ruleSupplierRulesAreCopiedVerbatim() {
    var rules = RuleMapper.createRules(new RuleSupplierForm(), null);

    assertThat(rules).hasSize(1);
    var rule = rules.get(0);
    assertThat(rule.filter()).isEqualTo("state.qty > 5");
    assertThat(rule.action()).isEqualTo(RuleAction.SetStateValue);
    assertThat(rule.fieldName()).isEqualTo("price");
    assertThat(rule.fieldAttribute()).isEqualTo(RuleFieldAttribute.required);
    assertThat(rule.value()).isEqualTo("0");
    assertThat(rule.expression()).isEqualTo("true");
    assertThat(rule.actionId()).isEqualTo("recalculate");
    assertThat(rule.result()).isEqualTo(RuleResult.Stop);
  }

  // ── DTO mapping ────────────────────────────────────────────────────────────

  @Test
  void mapRulesConvertsToDtosPreservingEveryAttribute() {
    List<RuleDto> dtos = RuleMapper.mapRules(new RuleSupplierForm(), null);

    assertThat(dtos).hasSize(1);
    var dto = dtos.get(0);
    assertThat(dto.filter()).isEqualTo("state.qty > 5");
    assertThat(dto.action()).isEqualTo(RuleActionDto.SetStateValue);
    assertThat(dto.fieldName()).isEqualTo("price");
    assertThat(dto.fieldAttribute()).isEqualTo(RuleFieldAttributeDto.required);
    assertThat(dto.value()).isEqualTo("0");
    assertThat(dto.expression()).isEqualTo("true");
    assertThat(dto.actionId()).isEqualTo("recalculate");
    assertThat(dto.result()).isEqualTo(RuleResultDto.Stop);
  }

  @Test
  void mapToRuleDtoDefaultsNullEnumsSafely() {
    var dto = RuleMapper.mapToRule(io.mateu.uidl.data.Rule.builder().fieldName("anything").build());

    assertThat(dto.action()).isEqualTo(RuleActionDto.RunAction);
    assertThat(dto.fieldAttribute()).isNull();
    assertThat(dto.result()).isNull();
    assertThat(dto.fieldName()).isEqualTo("anything");
  }
}
