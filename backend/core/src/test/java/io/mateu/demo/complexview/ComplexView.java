package io.mateu.demo.complexview;

import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.elements.Element;
import io.mateu.demo.AnotherSimpleForm;
import io.mateu.demo.SimpleForm;
import io.mateu.demo.complexview.crud.SimpleCrud;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@MateuUI("/complexview")
@Getter
@Setter
public class ComplexView {

  @Slot(SlotName.left)
  @VerticalLayout
  List<Object> left = List.of(new SimpleCard(), new SimpleCard());

  @Slot(SlotName.left)
  SimpleCard simpleCard = new SimpleCard();

  @Slot(SlotName.right)
  @VerticalLayout
  List<Object> right = List.of(new SimpleCard(), new SimpleCard());


  @Slot(SlotName.header)
  @VerticalLayout
  List<Object> header = List.of(new Element("h1", "This is the title"),
          new Element("h2", "This is the subtitle"));

  HorizontalLayoutContainer horizontalLayoutContainer;

  AnotherSimpleForm anotherSimpleForm;

  @HorizontalLayout
  List<Object> hl = List.of(new SimpleCard(), new SimpleCard());

  String stringField = "stringField";

  SimpleCrud simpleCrud;

  @Slot(SlotName.footer)
  @RawContent
  String htmlInFooter = """
          <h2>Hola! esto es el footer</h2>
          """;

}
