package io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.metadataBuilders.FormMetadataBuilder;
import io.mateu.core.domain.model.outbound.metadataBuilders.RpcViewWrapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.FormIdentifier;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.core.interfaces.*;
import io.mateu.core.domain.uidefinition.shared.annotations.SlotName;
import io.mateu.core.domain.uidefinition.shared.data.Stepper;
import io.mateu.core.domain.uidefinition.shared.interfaces.Form;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class ViewInstancePartsExtractor {

  final FormMetadataBuilder formMetadataBuilder;
  final JpaRpcCrudFactory jpaRpcCrudFactory;
  final ReflectionHelper reflectionHelper;
  private final FormIdentifier formIdentifier;

  public List<ViewInstancePart> getUiParts(
      Object viewInstance, List<Field> fields, SlotName slotName) throws Exception {
    List<ViewInstancePart> parts = new ArrayList<>();

    List<Field> partCandidates = new ArrayList<>();
    List<Field> leftFields = new ArrayList<>();
    fields.forEach(
        f -> {
          if (Crud.class.isAssignableFrom(f.getType())
              || Card.class.isAssignableFrom(f.getType())
              || (Stepper.class.isAssignableFrom(f.getType()) && fields.size() == 1)
              || (Form.class.isAssignableFrom(f.getType()))
              || formMetadataBuilder.isOwner(f)
              || !SlotName.main.equals(slotName)
              || viewInstance instanceof Container) {
            partCandidates.add(f);
          } else {
            leftFields.add(f);
          }
        });

    for (Field f : partCandidates) {
      parts.add(buildPart(f, viewInstance, slotName));
    }
    if (!leftFields.isEmpty()) {
      parts.add(0, new ViewInstancePart(slotName, true, viewInstance, null, leftFields));
    }

    if (viewInstance instanceof HasStepper hasStepper && SlotName.main.equals(slotName)) {
      parts.add(0, buildPart(hasStepper.getStepper(), slotName));
    }

    return parts;
  }

  private ViewInstancePart buildPart(Field f, Object uiInstance, SlotName slotName)
      throws Exception {
    Object partInstance = reflectionHelper.getValue(f, uiInstance);
    if (partInstance == null) {
      partInstance = reflectionHelper.newInstance(f.getType());
    }
    if (partInstance instanceof Listing<?, ?> listing) {
      partInstance = new RpcViewWrapper(listing, f.getId());
    }
    return new ViewInstancePart(
        slotName, formIdentifier.isForm(f, partInstance), partInstance, f, List.of());
  }

  private ViewInstancePart buildPart(Stepper stepper, SlotName slotName) {
    return new ViewInstancePart(slotName, false, stepper, null, List.of());
  }
}