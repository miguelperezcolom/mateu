package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.BulletedListDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.uidl.annotations.BulletedList;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.Component;
import java.util.List;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Bulleted lists: a @BulletedList collection field renders as a plain read-only &lt;ul&gt;
 * (stereotype bulletedList), and the fluent io.mateu.uidl.data.BulletedList component travels as
 * BulletedListDto with its items.
 */
class BulletedListSyncTest {

  @SuppressWarnings("unused")
  @UI("/bulleted")
  @Title("Bulleted")
  public static class BulletedForm {
    @BulletedList List<String> preferencias = List.of("Almohada extra", "Planta alta");

    @Label("")
    Callable<Component> fluent =
        () -> io.mateu.uidl.data.BulletedList.builder().items(List.of("Vista mar", "Cuna")).build();
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(BulletedForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void bulletedListAnnotationBecomesItsStereotype() {
    var increment = mateu.sync("/bulleted");
    var fields =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), FormFieldDto.class);
    assertThat(fields)
        .extracting(FormFieldDto::fieldId, FormFieldDto::stereotype)
        .contains(org.assertj.core.groups.Tuple.tuple("preferencias", "bulletedList"));
  }

  @Test
  void fluentBulletedListTravelsAsItsDtoWithItems() {
    var increment = mateu.sync("/bulleted");
    var lists =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), BulletedListDto.class);
    assertThat(lists).hasSize(1);
    assertThat(lists.get(0).items()).containsExactly("Vista mar", "Cuna");
  }
}
