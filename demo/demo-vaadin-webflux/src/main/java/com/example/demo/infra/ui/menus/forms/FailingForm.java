package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.core.interfaces.ConsumesContextData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
public class FailingForm implements ConsumesContextData {

    String aField = "xxx";

    @Override
    public void consume(Map<String, Object> context, ServerHttpRequest serverHttpRequest) {
        throw new RuntimeException("Something unexpected happened :(");
    }
}
