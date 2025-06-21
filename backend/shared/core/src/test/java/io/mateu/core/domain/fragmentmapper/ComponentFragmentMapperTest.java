package io.mateu.core.domain.fragmentmapper;

import static org.junit.jupiter.api.Assertions.*;

import com.example.fluent.SampleAppProvider;
import com.example.fluent.SampleFormProvider;
import io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper;
import io.mateu.core.domain.fragmentmapper.componentbased.mappers.AppComponentToDtoMapper;
import io.mateu.core.domain.fragmentmapper.componentbased.mappers.FormComponentToDtoMapper;
import io.mateu.core.domain.fragmentmapper.componentbased.mappers.FormLayoutComponentToDtoMapper;
import io.mateu.core.domain.fragmentmapper.componentbased.mappers.HorizontalLayoutComponentToDtoMapper;
import io.mateu.core.domain.fragmentmapper.componentbased.mappers.SplitLayoutComponentToDtoMapper;
import io.mateu.core.domain.fragmentmapper.componentbased.mappers.TabLayoutComponentToDtoMapper;
import io.mateu.core.domain.fragmentmapper.componentbased.mappers.VerticalLayoutComponentToDtoMapper;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.FormDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.HorizontalLayoutJustification;
import io.mateu.uidl.data.HorizontalLayoutVerticalAlignment;
import io.mateu.uidl.data.LabelPosition;
import io.mateu.uidl.data.SpacingVariant;
import io.mateu.uidl.data.SplitLayout;
import io.mateu.uidl.data.SplitLayoutOrientation;
import io.mateu.uidl.data.SplitLayoutVariant;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalAlignment;
import io.mateu.uidl.data.VerticalLayout;
import java.util.List;
import org.junit.jupiter.api.Test;

class ComponentFragmentMapperTest {

  @Test
  void constructorsWork() {
    assertNotNull(new AppComponentToDtoMapper());
    assertNotNull(new ComponentToFragmentDtoMapper());
    assertNotNull(new FormComponentToDtoMapper());
    assertNotNull(new HorizontalLayoutComponentToDtoMapper());
    assertNotNull(new VerticalLayoutComponentToDtoMapper());
    assertNotNull(new FormLayoutComponentToDtoMapper());
    assertNotNull(new SplitLayoutComponentToDtoMapper());
    assertNotNull(new TabLayoutComponentToDtoMapper());
  }

  @Test
  void stringPassesThrough() {
    var mapper = new ComponentFragmentMapper();
    Object fragment =
        mapper.mapToFragment(
            "hola!", "base_url", "route", "initiator_component_id", new FakeHttpRequest());
    assertNotNull(fragment);
    assertEquals("hola!", fragment);
  }

  @Test
  void formIsMapped() {
    var mapper = new ComponentFragmentMapper();
    UIFragmentDto fragment =
        (UIFragmentDto)
            mapper.mapToFragment(
                new SampleFormProvider(),
                "base_url",
                "route",
                "initiator_component_id",
                new FakeHttpRequest());
    assertNotNull(fragment);
    assertInstanceOf(FormDto.class, fragment.component().metadata());
  }

  @Test
  void appIsMapped() {
    var mapper = new ComponentFragmentMapper();
    var fragment =
        mapper.mapToFragment(
            new SampleAppProvider(),
            "base_url",
            "route",
            "initiator_component_id",
            new FakeHttpRequest());
    assertNotNull(fragment);
  }

  @Test
  void horizontalLayoutIsMapped() {
    var mapper = new ComponentFragmentMapper();
    var fragment =
        mapper.mapToFragment(
            HorizontalLayout.builder()
                .style("style")
                .padding(true)
                .spacing(true)
                .margin(true)
                .content(List.of(new Text("Hola 1!"), new Text("Hola 2!")))
                .wrap(true)
                .flexGrows(List.of(1))
                .fullWidth(true)
                .justification(HorizontalLayoutJustification.AROUND)
                .spacingVariant(SpacingVariant.l)
                .verticalAlignment(HorizontalLayoutVerticalAlignment.BASELINE)
                .build(),
            "base_url",
            "route",
            "initiator_component_id",
            new FakeHttpRequest());
    assertNotNull(fragment);
  }

  @Test
  void verticalLayoutIsMapped() {
    var mapper = new ComponentFragmentMapper();
    var fragment =
        mapper.mapToFragment(
            VerticalLayout.builder()
                .style("style")
                .padding(true)
                .spacing(true)
                .margin(true)
                .content(List.of(new Text("Hola 1!"), new Text("Hola 2!")))
                .wrap(true)
                .flexGrows(List.of(1))
                .fullWidth(true)
                .justification(HorizontalLayoutJustification.AROUND)
                .spacingVariant(SpacingVariant.l)
                .verticalAlignment(VerticalAlignment.CENTER)
                .build(),
            "base_url",
            "route",
            "initiator_component_id",
            new FakeHttpRequest());
    assertNotNull(fragment);
  }

  @Test
  void formLayoutIsMapped() {
    var mapper = new ComponentFragmentMapper();
    var fragment =
        mapper.mapToFragment(
            FormLayout.builder()
                .style("style")
                .content(List.of(new Text("Hola 1!"), new Text("Hola 2!")))
                .columns(2)
                .columnSpacing(SpacingVariant.l)
                .itemLabelSpacing(SpacingVariant.m)
                .itemRowSpacing(SpacingVariant.s)
                .labelPosition(LabelPosition.side)
                .build(),
            "base_url",
            "route",
            "initiator_component_id",
            new FakeHttpRequest());
    assertNotNull(fragment);
  }

  @Test
  void tabLayoutIsMapped() {
    var mapper = new ComponentFragmentMapper();
    var fragment =
        mapper.mapToFragment(
            TabLayout.builder()
                .style("style")
                .tabs(
                    List.of(
                        new Tab("Tab 1", new Text("Hola 1!")),
                        new Tab("Tab 2", new Text("Hola 2!"))))
                .build(),
            "base_url",
            "route",
            "initiator_component_id",
            new FakeHttpRequest());
    assertNotNull(fragment);
  }

  @Test
  void splitLayoutIsMapped() {
    var mapper = new ComponentFragmentMapper();
    var fragment =
        mapper.mapToFragment(
            SplitLayout.builder()
                .style("style")
                .detail(new Text("Hola 1!"))
                .master(new Text("Hola 2!"))
                .orientation(SplitLayoutOrientation.horizontal)
                .variant(SplitLayoutVariant.minimal)
                .build(),
            "base_url",
            "route",
            "initiator_component_id",
            new FakeHttpRequest());
    assertNotNull(fragment);
  }

  @Test
  void textIsMapped() {
    var mapper = new ComponentFragmentMapper();
    var fragment =
        mapper.mapToFragment(
            new Text("hola!"),
            "base_url",
            "route",
            "initiator_component_id",
            new FakeHttpRequest());
    assertNotNull(fragment);
  }
}
