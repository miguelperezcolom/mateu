package io.mateu.core.infra.declarative.orchestrators.importwizard;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The guided import turns CSV records into typed rows: every mapped cell is coerced into its target
 * field and the row is validated against the same bean constraints the form uses. A row that does
 * not convert or breaks a constraint is reported (line + column + problem) and NOT imported.
 */
class ImportRowAssemblerTest {

  enum Tier {
    GOLD,
    SILVER
  }

  public static class Product {
    public static String CATALOGUE = "x"; // static: never a target
    public final String sku = "fixed"; // final: never a target

    @NotBlank public String name;
    @NotNull public Integer stock;

    @Min(1)
    @Max(10)
    public Long priority;

    public Double weight;
    public Float ratio;
    public Boolean active;
    public BigDecimal price;
    public LocalDate since;
    public LocalDateTime updated;
    public LocalTime opens;
    public Tier tier;
    public int units;
    public List<String> tags; // not coercible from one cell
  }

  public static class Note {
    @NotEmpty public String text;
  }

  private static List<ColumnMapping> identity(String... columns) {
    return java.util.Arrays.stream(columns).map(c -> new ColumnMapping(c, "", c)).toList();
  }

  @Test
  void onlyWritableBasicFieldsAreOfferedAsTargets() {
    var names =
        ImportRowAssembler.assignableFields(Product.class).stream().map(Field::getName).toList();
    assertThat(names)
        .contains(
            "name",
            "stock",
            "priority",
            "weight",
            "ratio",
            "active",
            "price",
            "since",
            "updated",
            "opens",
            "tier",
            "units")
        .doesNotContain("CATALOGUE", "sku", "tags");
  }

  @Test
  void everyBasicTypeIsCoercedFromItsCsvText() {
    var preview =
        ImportRowAssembler.assemble(
            Product.class,
            List.of(
                List.of(
                    "name",
                    "stock",
                    "priority",
                    "weight",
                    "ratio",
                    "active",
                    "price",
                    "since",
                    "updated",
                    "opens",
                    "tier",
                    "units"),
                List.of(
                    " Chair ",
                    "12",
                    "3",
                    "4.5",
                    "0.25",
                    "true",
                    "19.99",
                    "2024-02-29",
                    "2024-03-01T10:15:30",
                    "09:30",
                    "GOLD",
                    "7")),
            identity(
                "name",
                "stock",
                "priority",
                "weight",
                "ratio",
                "active",
                "price",
                "since",
                "updated",
                "opens",
                "tier",
                "units"));

    assertThat(preview.issues()).isEmpty();
    assertThat(preview.invalidRowCount()).isZero();
    var row = preview.validRows().get(0);
    assertThat(row.name).isEqualTo("Chair");
    assertThat(row.stock).isEqualTo(12);
    assertThat(row.priority).isEqualTo(3L);
    assertThat(row.weight).isEqualTo(4.5d);
    assertThat(row.ratio).isEqualTo(0.25f);
    assertThat(row.active).isTrue();
    assertThat(row.price).isEqualByComparingTo("19.99");
    assertThat(row.since).isEqualTo(LocalDate.of(2024, 2, 29));
    assertThat(row.updated).isEqualTo(LocalDateTime.of(2024, 3, 1, 10, 15, 30));
    assertThat(row.opens).isEqualTo(LocalTime.of(9, 30));
    assertThat(row.tier).isEqualTo(Tier.GOLD);
    assertThat(row.units).isEqualTo(7);
  }

  @Test
  void aCellThatDoesNotConvertRejectsTheRowAndNamesTheColumnAndValue() {
    var preview =
        ImportRowAssembler.assemble(
            Product.class,
            List.of(List.of("Product name", "Qty"), List.of("Desk", "lots"), List.of("Lamp", "4")),
            List.of(
                new ColumnMapping("Product name", "Desk", "name"),
                new ColumnMapping("Qty", "lots", "stock")));

    assertThat(preview.validRows()).extracting(p -> p.name).containsExactly("Lamp");
    assertThat(preview.invalidRowCount()).isEqualTo(1);
    var issue = preview.issues().get(0);
    assertThat(issue.line).isEqualTo(2); // 1-based, the header is line 1
    assertThat(issue.column).isEqualTo("Qty");
    assertThat(issue.value).isEqualTo("lots");
    assertThat(issue.problem).isEqualTo("Cannot convert to Integer");
  }

  @Test
  void constraintsAreCheckedAgainstTheBuiltRowAndReportedUnderTheMappedColumn() {
    var preview =
        ImportRowAssembler.assemble(
            Product.class,
            List.of(
                List.of("Name", "Stock", "Prio"),
                List.of("   ", "", "0"), // blank name, missing stock, priority below @Min
                List.of("Ok", "1", "11"), // priority above @Max
                List.of("Fine", "2", "5")),
            List.of(
                new ColumnMapping("Name", "", "name"),
                new ColumnMapping("Stock", "", "stock"),
                new ColumnMapping("Prio", "", "priority")));

    assertThat(preview.validRows()).extracting(p -> p.name).containsExactly("Fine");
    assertThat(preview.invalidRowCount()).isEqualTo(2);
    assertThat(preview.issues())
        .extracting(i -> i.line + "|" + i.column + "|" + i.value + "|" + i.problem)
        .containsExactlyInAnyOrder(
            "2|Name||Must not be blank",
            "2|Stock||Must not be null",
            "2|Prio|0|Must be at least 1",
            "3|Prio|11|Must be at most 10");
  }

  @Test
  void notEmptyRejectsAMissingValue() {
    var preview =
        ImportRowAssembler.assemble(
            Note.class,
            List.of(List.of("text"), List.of("")),
            List.of(new ColumnMapping("text", "", "text")));
    assertThat(preview.validRows()).isEmpty();
    assertThat(preview.issues()).extracting(i -> i.problem).containsExactly("Must not be empty");
  }

  @Test
  void skippedAndShortColumnsLeaveTheFieldDefaultAndAnUnknownTargetIsReported() {
    var preview =
        ImportRowAssembler.assemble(
            Product.class,
            List.of(List.of("name", "stock", "ignored", "extra"), List.of("Shelf", "3", "zzz")),
            List.of(
                new ColumnMapping("name", "", "name"),
                new ColumnMapping("stock", "", "stock"),
                new ColumnMapping("ignored", "", " "), // blank target = skip the column
                new ColumnMapping("extra", "", "weight"), // the record is shorter than the header
                new ColumnMapping("missing", "", "price"), // not in the header at all
                new ColumnMapping("name", "", "nickname"))); // no such field

    assertThat(preview.validRows()).isEmpty();
    assertThat(preview.issues())
        .extracting(i -> i.column + "|" + i.problem)
        .containsExactly("name|Unknown target field");

    var withoutTheTypo =
        ImportRowAssembler.assemble(
            Product.class,
            List.of(List.of("name", "stock", "extra"), List.of("Shelf", "3")),
            List.of(
                new ColumnMapping("name", "", "name"),
                new ColumnMapping("stock", "", "stock"),
                new ColumnMapping("extra", "", "weight")));
    var row = withoutTheTypo.validRows().get(0);
    assertThat(row.weight).isNull();
    assertThat(row.price).isNull();
  }

  @Test
  void aHeaderWithoutDataOrNoMappingsImportsNothing() {
    assertThat(
            ImportRowAssembler.assemble(Product.class, List.of(List.of("name")), identity("name"))
                .validRows())
        .isEmpty();
    assertThat(
            ImportRowAssembler.assemble(
                    Product.class, List.of(List.of("name"), List.of("x")), List.of())
                .validRows())
        .isEmpty();
    assertThat(
            ImportRowAssembler.assemble(Product.class, List.of(List.of("name"), List.of("x")), null)
                .issues())
        .isEmpty();
  }
}
