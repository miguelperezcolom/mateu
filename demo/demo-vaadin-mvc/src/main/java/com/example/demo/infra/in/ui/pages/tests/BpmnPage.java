package com.example.demo.infra.in.ui.pages.tests;

import io.mateu.uidl.RouteConstants;
import io.mateu.uidl.annotations.Breadcrumb;
import io.mateu.uidl.annotations.Breadcrumbs;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.OptionsLayout;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.Bpmn;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.BreadcrumbsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.OptionsSupplier;

import java.util.ArrayList;
import java.util.List;

@Route(value = "/bpmn", parentRoute = RouteConstants.NO_PARENT_ROUTE)
public class BpmnPage {

    Bpmn bpmn = new Bpmn("""
            <?xml version="1.0" encoding="UTF-8"?>
            <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_1i6xvkk" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.26.0" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.5.0">
              <bpmn:process id="Process_0re5o34" isExecutable="true">
                <bpmn:startEvent id="StartEvent_1">
                  <bpmn:outgoing>Flow_0b22o04</bpmn:outgoing>
                </bpmn:startEvent>
                <bpmn:task id="Activity_0vtd6pe">
                  <bpmn:incoming>Flow_0b22o04</bpmn:incoming>
                  <bpmn:outgoing>Flow_0al064v</bpmn:outgoing>
                </bpmn:task>
                <bpmn:sequenceFlow id="Flow_0b22o04" sourceRef="StartEvent_1" targetRef="Activity_0vtd6pe" />
                <bpmn:task id="Activity_1jl3ku9">
                  <bpmn:incoming>Flow_0al064v</bpmn:incoming>
                  <bpmn:outgoing>Flow_0uzkvp5</bpmn:outgoing>
                </bpmn:task>
                <bpmn:sequenceFlow id="Flow_0al064v" sourceRef="Activity_0vtd6pe" targetRef="Activity_1jl3ku9" />
                <bpmn:endEvent id="Event_131p7g2">
                  <bpmn:incoming>Flow_0uzkvp5</bpmn:incoming>
                </bpmn:endEvent>
                <bpmn:sequenceFlow id="Flow_0uzkvp5" sourceRef="Activity_1jl3ku9" targetRef="Event_131p7g2" />
              </bpmn:process>
              <bpmndi:BPMNDiagram id="BPMNDiagram_1">
                <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_0re5o34">
                  <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
                    <dc:Bounds x="179" y="99" width="36" height="36" />
                  </bpmndi:BPMNShape>
                  <bpmndi:BPMNShape id="Activity_0vtd6pe_di" bpmnElement="Activity_0vtd6pe">
                    <dc:Bounds x="270" y="77" width="100" height="80" />
                  </bpmndi:BPMNShape>
                  <bpmndi:BPMNShape id="Activity_1jl3ku9_di" bpmnElement="Activity_1jl3ku9">
                    <dc:Bounds x="430" y="77" width="100" height="80" />
                  </bpmndi:BPMNShape>
                  <bpmndi:BPMNShape id="Event_131p7g2_di" bpmnElement="Event_131p7g2">
                    <dc:Bounds x="592" y="99" width="36" height="36" />
                  </bpmndi:BPMNShape>
                  <bpmndi:BPMNEdge id="Flow_0b22o04_di" bpmnElement="Flow_0b22o04">
                    <di:waypoint x="215" y="117" />
                    <di:waypoint x="270" y="117" />
                  </bpmndi:BPMNEdge>
                  <bpmndi:BPMNEdge id="Flow_0al064v_di" bpmnElement="Flow_0al064v">
                    <di:waypoint x="370" y="117" />
                    <di:waypoint x="430" y="117" />
                  </bpmndi:BPMNEdge>
                  <bpmndi:BPMNEdge id="Flow_0uzkvp5_di" bpmnElement="Flow_0uzkvp5">
                    <di:waypoint x="530" y="117" />
                    <di:waypoint x="592" y="117" />
                  </bpmndi:BPMNEdge>
                </bpmndi:BPMNPlane>
              </bpmndi:BPMNDiagram>
            </bpmn:definitions>
            
            """, "width: 20rem; height: 20rem;", "");

}
