package io.mateu.demo.complexview;

import io.mateu.demo.AnotherSimpleForm;
import io.mateu.demo.complexview.crud.SimpleCrud;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Element;
import io.mateu.uidl.interfaces.Card;
import io.mateu.uidl.interfaces.Container;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@MateuUI("/complexview")
@Getter
@Setter
public class ComplexView implements Container {

  @Slot(SlotName.left)
  @VerticalLayouted
  List<Object> left =
      List.of(
          new Card("Simple Card 1", "Subtitle 1", "Content 1"),
          new Card("Simple Card 2", "Subtitle 2", "Content 2"));

  @Slot(SlotName.left)
  Card simpleCard = new Card("Simple Card 3", "Subtitle 3", "Content 3");

  @Slot(SlotName.right)
  @VerticalLayouted
  List<Object> right =
      List.of(
          new Card("Simple Card 7", "Subtitle 7", "Content 7"),
          new Card("Simple Card 8", "Subtitle 8", "Content 8"));

  @Slot(SlotName.header)
  @VerticalLayouted
  List<Object> header =
      List.of(new Element("h1", "This is the title"), new Element("h2", "This is the subtitle"));

  HorizontalLayoutContainer horizontalLayoutContainer;

  AnotherSimpleForm anotherSimpleForm;

  @HorizontalLayouted
  List<Object> hl =
      List.of(
          new Card("Simple Card 5", "Subtitle 5", "Content 5"),
          new Card("Simple Card 6", "Subtitle 6", "Content 6"));

  @TabLayouted HorizontalLayoutContainer tabs;

  String stringField = "stringField";

  SimpleCrud simpleCrud;

  @Slot(SlotName.footer)
  @RawContent
  String htmlInFooter = "<h2>Hola! esto es el footer</h2>";
}
