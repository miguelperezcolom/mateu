package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.*;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.dtos.*;
import io.mateu.uidl.annotations.SlotName;
import io.mateu.uidl.views.SingleComponentView;
import java.util.ArrayList;
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

  public ViewDto map(
      io.mateu.uidl.interfaces.View view,
      String baseUrl,
      ServerHttpRequest serverHttpRequest,
      Map<String, ComponentDto> allComponentsInStep,
      Map<String, Object> data)
      throws Throwable {

    var actualObject = actualUiInstanceProvider.getActualUiInstance(view, serverHttpRequest);

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

    if (view instanceof SingleComponentView singleComponentView) {

      List<Field> slotFields =
          fieldExtractor.getFields(singleComponentView.component(), SlotName.main);
      List<ViewInstancePart> viewInstanceParts =
          viewInstancePartsExtractor.getUiParts(
              singleComponentView.component(), slotFields, SlotName.main);
      if (viewInstanceParts.isEmpty()) {
        viewInstanceParts.add(
            new ViewInstancePart(SlotName.main, true, actualObject, null, List.of()));
      }
      viewInstanceParts.forEach(
          p -> {
            var componentInstance = p.getUiInstance();
            var component =
                componentFactory.createComponent(
                    p.isForm(),
                    componentInstance,
                    baseUrl,
                    serverHttpRequest,
                    p.getField(),
                    p.getFields(),
                    allComponentsInStep,
                    componentCounter,
                    data);
            componentIdsPerSlot.get(SlotName.main).add(component);
          });

    } else {

      for (SlotName slot :
          List.of(SlotName.header, SlotName.left, SlotName.right, SlotName.footer, SlotName.main)) {

        List<Field> slotFields = fieldExtractor.getFields(view, slot);

        List<ViewInstancePart> viewInstanceParts =
            viewInstancePartsExtractor.getUiParts(view, slotFields, slot);

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
                      baseUrl,
                      serverHttpRequest,
                      p.getField(),
                      p.getFields(),
                      allComponentsInStep,
                      componentCounter,
                      data);
              componentIdsPerSlot.get(slot).add(component);
            });
      }
    }

    return new ViewDto(
        new ViewPartDto(null, header),
        new ViewPartDto(null, left),
        new ViewPartDto(null, main),
        new ViewPartDto(null, right),
        new ViewPartDto(null, footer));
  }
}
