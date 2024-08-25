package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.*;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.shared.annotations.SlotName;
import io.mateu.dtos.*;
import io.mateu.dtos.JourneyContainer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class ViewMapper {

  private final FieldExtractor fieldExtractor;
  private final ViewInstancePartsExtractor viewInstancePartsExtractor;
  private final ComponentFactory componentFactory;
  private final ActualUiInstanceProvider actualUiInstanceProvider;

  public ViewMapper(
      FieldExtractor fieldExtractor,
      ViewInstancePartsExtractor viewInstancePartsExtractor,
      ComponentFactory componentFactory,
      ActualUiInstanceProvider actualUiInstanceProvider) {
    this.fieldExtractor = fieldExtractor;
    this.viewInstancePartsExtractor = viewInstancePartsExtractor;
    this.componentFactory = componentFactory;
    this.actualUiInstanceProvider = actualUiInstanceProvider;
  }

  public View map(
      JourneyContainer journeyContainer,
      String stepId,
      Object object,
      ServerHttpRequest serverHttpRequest,
      HashMap<String, Component> allComponentsInStep)
      throws Throwable {

    var actualObject =
        actualUiInstanceProvider.getActualUiInstance(
            journeyContainer, stepId, object, serverHttpRequest);

    List<String> left = new ArrayList<>();
    List<String> main = new ArrayList<>();
    List<String> right = new ArrayList<>();
    List<String> header = new ArrayList<>();
    List<String> footer = new ArrayList<>();

    Map<SlotName, List<String>> componentIdsPerSlot =
        Map.of(
            SlotName.header, header,
            SlotName.left, left,
            SlotName.main, main,
            SlotName.right, right,
            SlotName.footer, footer);

    var componentCounter = new AtomicInteger();

    for (SlotName slot :
        List.of(SlotName.header, SlotName.left, SlotName.main, SlotName.right, SlotName.footer)) {

      List<Field> slotFields = fieldExtractor.getFields(actualObject, slot);

      List<ViewInstancePart> viewInstanceParts =
          viewInstancePartsExtractor.getUiParts(actualObject, slotFields, slot);

      if (SlotName.main.equals(slot) && viewInstanceParts.isEmpty()) {
        viewInstanceParts.add(new ViewInstancePart(slot, true, actualObject, null, List.of()));
      }

      viewInstanceParts.forEach(
          p -> {
            var componentInstance = p.getUiInstance();
            var component =
                componentFactory.createComponent(
                    p.isForm(),
                    componentInstance,
                    stepId,
                    journeyContainer,
                    serverHttpRequest,
                    p.getField(),
                    p.getFields(),
                    allComponentsInStep,
                    componentCounter);
            componentIdsPerSlot.get(slot).add(component);
          });
    }

    return new View(
        List.of(),
        new ViewPart(null, header),
        new ViewPart(null, left),
        new ViewPart(null, main),
        new ViewPart(null, right),
        new ViewPart(null, footer));
  }
}
