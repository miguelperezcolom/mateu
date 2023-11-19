package io.mateu.core.domain.commands.runStepAction;

import java.util.*;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;

@Builder
@Slf4j
@Getter
public class RunStepActionCommand {

  private String journeyTypeId;

  private String journeyId;

  private String stepId;

  private String actionId;

  private Map<String, Object> data;

  private ServerHttpRequest serverHttpRequest;
}
