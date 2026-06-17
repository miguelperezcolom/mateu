package com.example.demo.infra.in.ui.pages.tests;

import io.mateu.uidl.RouteConstants;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.WorkflowElk;

@Route(value = "/workflow-elk", parentRoute = RouteConstants.NO_PARENT_ROUTE)
public class WorkflowElkPage {

    WorkflowElk workflow = new WorkflowElk("""
            {
              "id": "sample-workflow",
              "name": "Sample Workflow",
              "version": "1.0",
              "steps": [
                { "id": "step1", "type": "ACTION", "name": "Start", "topic": "start-topic" },
                { "id": "step2", "type": "USER_TASK", "name": "Review", "preconditionStepId": "step1", "formId": "review-form" },
                { "id": "step3", "type": "ACTION", "name": "Process", "preconditionStepId": "step2", "topic": "process-topic" },
                { "id": "step4", "type": "END", "name": "End", "preconditionStepId": "step3" }
              ]
            }
            """, false, "width: 100%; height: 600px;", "");

}
