package io.mateu.explorer.examples.behaviour.stereotypetreeselect;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.TreeSelect;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.OptionsSupplier;
import java.util.List;

/**
 * {@code @TreeSelect}: the dropdown unfolds a TREE. The hierarchy is just options with children
 * (here from an {@link OptionsSupplier}); {@code leavesOnly = true} makes the groups expand-only,
 * so only a leaf can be picked.
 */
@Title("Destination")
public class DestinationPicker implements OptionsSupplier {

  @TreeSelect String region;

  @TreeSelect(leavesOnly = true)
  String island;

  @Override
  public List<Option> options(String fieldName, HttpRequest httpRequest) {
    return List.of(
        new Option(
            "es",
            "Spain",
            List.of(
                new Option(
                    "baleares",
                    "Balearic Islands",
                    List.of(new Option("mallorca", "Mallorca"), new Option("menorca", "Menorca"))),
                new Option(
                    "canarias",
                    "Canary Islands",
                    List.of(new Option("tenerife", "Tenerife"), new Option("lanzarote", "Lanzarote"))))),
        new Option(
            "pt",
            "Portugal",
            List.of(new Option("madeira", "Madeira"), new Option("azores", "Azores"))));
  }

  @Button
  Message go() {
    return Message.success("Region: " + region + " · island: " + island);
  }
}
