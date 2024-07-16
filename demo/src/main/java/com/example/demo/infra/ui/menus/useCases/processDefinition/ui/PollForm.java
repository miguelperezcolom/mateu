package com.example.demo.infra.ui.menus.useCases.processDefinition.ui;

import com.example.demo.infra.ui.menus.useCases.processDefinition.poller.Poller;
import io.mateu.domain.uidefinition.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.core.domain.uidefinition.shared.data.ResultType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Caption("Poll products")
public class PollForm {

  @Autowired
  Poller poller;

  @MainAction
  public Result pollFromInsuranceProduct() {
    poller.pollAll();
    return new Result(ResultType.Success, "All products polled", null, null, null);
  }
}
