package io.mateu.remote.domain.modelToDtoMappers;

import io.mateu.mdd.core.interfaces.HasSubtitle;
import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.core.interfaces.RpcCrudViewExtended;
import io.mateu.mdd.shared.annotations.SlotName;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.application.MateuRemoteClient;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.editors.FieldEditor;
import io.mateu.remote.domain.editors.MethodParametersEditor;
import io.mateu.remote.domain.editors.ObjectEditor;
import io.mateu.remote.domain.modelToDtoMappers.viewMapperStuff.*;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.*;
import io.mateu.remote.dtos.Crud;
import io.mateu.util.Helper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
public class ViewMapper {
  @PersistenceContext EntityManager em;

  @Autowired MateuRemoteClient mateuRemoteClient;

  @Autowired ApplicationContext applicationContext;

  @Autowired FieldExtractor fieldExtractor;

  @Autowired ViewMetadataBuilder viewMetadataBuilder;

  @Autowired DataExtractor dataExtractor;

  @Autowired RulesBuilder rulesBuilder;

  @Autowired UIInstancePartsExtractor uiInstancePartsExtractor;

  public View map(
      JourneyContainer journeyContainer,
      String stepId,
      Object uiInstance,
      Map<String, Object> data,
      List<Rule> rules,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    // mddopencrudaction, crud class

    Object actualUiInstance =
        getActualUiInstance(journeyContainer, stepId, uiInstance, serverHttpRequest);

    data.putAll(dataExtractor.getData(uiInstance, actualUiInstance));

    // todo: build left, main and right in a separate manner
    List<Component> left = new ArrayList<>();
    List<Component> main = new ArrayList<>();
    List<Component> right = new ArrayList<>();
    List<Component> header = new ArrayList<>();
    List<Component> footer = new ArrayList<>();

    Map<SlotName, List<Component>> componentsPerSlot =
        Map.of(
            SlotName.left, left,
            SlotName.main, main,
            SlotName.right, right,
            SlotName.header, header,
            SlotName.footer, footer);

    for (SlotName slot :
        List.of(SlotName.main, SlotName.left, SlotName.right, SlotName.header, SlotName.footer)) {

      List<FieldInterfaced> slotFields = fieldExtractor.getFields(actualUiInstance, slot);

      List<UIInstancePart> uiInstanceParts =
          uiInstancePartsExtractor.getUiParts(actualUiInstance, slotFields, slot);
      if (SlotName.main.equals(slot) && uiInstanceParts.size() == 0) {
        uiInstanceParts.add(new UIInstancePart("", actualUiInstance, List.of()));
      }

      uiInstanceParts.forEach(
          p -> {
            ViewMetadata metadata =
                viewMetadataBuilder.getMetadata(
                    stepId, uiInstance, p.getUiInstance(), p.getFields());
            metadata.setDataPrefix(p.getDataPrefix());
            rules.addAll(rulesBuilder.buildRules(metadata, p.getUiInstance()));
            componentsPerSlot
                .get(slot)
                .add(Component.builder().metadata(metadata).attributes(new HashMap<>()).build());
          });
    }

    addComponentIds(left, main, right, rules);
    removeTitleForFirstComponent(main);

    View view =
        View.builder()
            .title(getTitle(actualUiInstance))
            .subtitle(getSubtitle(actualUiInstance))
            .left(ViewPart.builder().components(left).build())
            .main(ViewPart.builder().components(main).build())
            .right(ViewPart.builder().components(right).build())
            .header(ViewPart.builder().components(header).build())
            .footer(ViewPart.builder().components(footer).build())
            .build();

    return view;
  }

  private void removeTitleForFirstComponent(List<Component> slot) {
    if (slot.size() > 0) {
      ViewMetadata metadata = slot.get(0).getMetadata();
      if (metadata instanceof Form) {
        ((Form) metadata).setTitle(null);
        ((Form) metadata).setSubtitle(null);
      } else if (metadata instanceof Crud) {
        ((Crud) metadata).setTitle(null);
        ((Crud) metadata).setSubtitle(null);
      }
    }
  }

  private String getSubtitle(Object uiInstance) {
    if (uiInstance instanceof Result) {
      return null;
    }
    if (uiInstance instanceof HasSubtitle) {
      return ((HasSubtitle) uiInstance).getSubtitle();
    }
    return "";
  }

  private String getTitle(Object uiInstance) {
    if (uiInstance instanceof Result) {
      return null;
    }
    if (uiInstance instanceof HasTitle) {
      return ((HasTitle) uiInstance).getTitle();
    }
    return ReflectionHelper.getCaption(uiInstance);
  }

  private Object getActualUiInstance(
      JourneyContainer journeyContainer,
      String stepId,
      Object uiInstance,
      ServerHttpRequest serverHttpRequest)
      throws Exception {
    Object actualUiInstance = uiInstance;
    if (uiInstance instanceof EntityEditor) {
      EntityEditor entityEditor = (EntityEditor) uiInstance;
      actualUiInstance = em.find(entityEditor.getEntityClass(), entityEditor.getData().get("__id"));
    } else if (uiInstance instanceof ObjectEditor) {
      ObjectEditor objectEditor = (ObjectEditor) uiInstance;
      actualUiInstance =
          Helper.fromJson(Helper.toJson(objectEditor.getData()), objectEditor.getType());
    } else if (uiInstance instanceof FieldEditor) {
      FieldEditor fieldEditor = (FieldEditor) uiInstance;
      actualUiInstance =
          Helper.fromJson(Helper.toJson(fieldEditor.getData()), fieldEditor.getType());
    } else if (uiInstance instanceof MethodParametersEditor) {
      MethodParametersEditor methodParametersEditor = (MethodParametersEditor) uiInstance;
      // actualUiInstance = Helper.fromJson(Helper.toJson(fieldEditor.getData()),
      // fieldEditor.getType());
    } else if (("view".equals(stepId) || "edit".equals(stepId))
        && journeyContainer.getInitialStep() != null
        && "io.mateu.mdd.ui.cruds.JpaRpcCrudView"
            .equals(journeyContainer.getInitialStep().getType())) { // todo: check si es un crud jpa
      RpcCrudViewExtended rpcCrudView =
          (RpcCrudViewExtended)
              applicationContext
                  .getBean(JourneyStoreService.class)
                  .getViewInstance(
                      journeyContainer.getJourneyId(),
                      journeyContainer.getInitialStep().getId(),
                      serverHttpRequest);
      actualUiInstance =
          em.find(rpcCrudView.getEntityClass(), ((EntityEditor) uiInstance).getData().get("id"));
    } else if (uiInstance instanceof Class
        && Listing.class.isAssignableFrom((Class<?>) uiInstance)) {
      actualUiInstance = ReflectionHelper.newInstance((Class) uiInstance);
    }
    return actualUiInstance;
  }

  private void addComponentIds(
      List<Component> left, List<Component> main, List<Component> right, List<Rule> rules) {
    int i = 0;
    for (Component component :
        List.of(left, main, right).stream().flatMap(l -> l.stream()).collect(Collectors.toList())) {
      component.setId("component-" + i++);
      if (component.getMetadata() instanceof Crud) {
        Crud crud = (Crud) component.getMetadata();
        crud.getActions()
            .forEach(action -> action.setId(component.getId() + "___" + action.getId()));
      }
      if (component.getMetadata() instanceof Form) {
        Form form = (Form) component.getMetadata();
        Stream.concat(form.getActions().stream(), form.getMainActions().stream())
            .forEach(
                action -> {
                  rules.stream()
                      .filter(
                          r ->
                              RuleAction.HideAction.equals(r.getAction())
                                  || RuleAction.ShowAction.equals(r.getAction())
                                  || RuleAction.EnableAction.equals(r.getAction())
                                  || RuleAction.DisableAction.equals(r.getAction()))
                      .filter(r -> action.getId().equals(((String[]) r.getData())[0]))
                      .forEach(
                          r -> {
                            r.setData(new String[] {component.getId() + "___" + action.getId()});
                          });
                  action.setId(component.getId() + "___" + action.getId());
                });
      }
    }
  }
}
