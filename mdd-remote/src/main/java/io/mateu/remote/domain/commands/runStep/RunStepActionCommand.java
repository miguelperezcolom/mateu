package io.mateu.remote.domain.commands.runStep;

import io.mateu.mdd.core.interfaces.*;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.File;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.data.*;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.editors.FieldEditor;
import io.mateu.remote.domain.editors.MethodParametersEditor;
import io.mateu.remote.domain.files.StorageServiceAccessor;
import io.mateu.remote.domain.persistence.Merger;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Form;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import io.mateu.util.Serializer;
import io.mateu.util.persistence.EntityDeserializer;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import javax.naming.AuthenticationException;
import jakarta.persistence.Entity;

import java.awt.*;
import java.io.IOException;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Builder
@Slf4j@Getter
public class RunStepActionCommand {

    private String journeyTypeId;

    private String journeyId;

    private String stepId;

    private String actionId;

    private Map<String, Object> data;


}
