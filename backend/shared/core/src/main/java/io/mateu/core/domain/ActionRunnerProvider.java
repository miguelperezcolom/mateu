package io.mateu.core.domain;

public interface ActionRunnerProvider {

  ActionRunner get(Object instance, String actionId);
}
