package com.example.demo.infra.ui.menus.useCases.processDefinition.ui;

import com.example.demo.infra.ui.menus.useCases.processDefinition.poller.Poller;
import io.mateu.uidl.annotations.Caption;
import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.data.Result;
import io.mateu.uidl.data.ResultType;
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
    return new Result(
            "Poll all",
            ResultType.Success,
            "All products polled",
            null,
            null,
            null,
            null);
  }
}
