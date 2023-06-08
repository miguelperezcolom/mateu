package io.mateu.remote.domain.commands.runStep;

import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.Serializer;
import io.mateu.util.persistence.EntityDeserializer;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;

import java.util.*;

@Builder
@Slf4j@Getter
public class RunStepActionCommand {

    private String journeyTypeId;

    private String journeyId;

    private String stepId;

    private String actionId;

    private Map<String, Object> data;

    private ServerHttpRequest serverHttpRequest;


}
