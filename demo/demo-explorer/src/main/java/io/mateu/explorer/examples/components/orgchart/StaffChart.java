package io.mateu.explorer.examples.components.orgchart;

import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.OrgChart;
import io.mateu.uidl.data.OrgNode;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * An org chart whose people are clickable: a node's {@code actionId} runs on click, with the node
 * in {@code _clickedNode}.
 */
public class StaffChart implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return OrgChart.builder()
        .root(
            person(
                "director",
                "Elena Ruiz",
                "Museum director",
                List.of(
                    person("education", "Kwame Mensah", "Head of education", List.of()),
                    person("digital", "Ana Costa", "Head of digital", List.of()))))
        .build();
  }

  static OrgNode person(String id, String name, String role, List<OrgNode> reports) {
    return OrgNode.builder()
        .id(id)
        .title(name)
        .subtitle(role)
        .actionId("openPerson")
        .children(reports)
        .build();
  }

  public Message openPerson(HttpRequest httpRequest) {
    // the clicked node travels whole, as _clickedNode
    var node = (Map<?, ?>) httpRequest.runActionRq().parameters().get("_clickedNode");
    return new Message("Opening the profile of " + node.get("title") + " (" + node.get("subtitle") + ")");
  }
}
