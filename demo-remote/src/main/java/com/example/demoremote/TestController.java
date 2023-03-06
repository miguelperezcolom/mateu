package com.example.demoremote;

import io.mateu.remote.domain.queries.GetUIQuery;
import io.mateu.remote.dtos.UI;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController

@RequestMapping("test/v1")
public class TestController {

    @GetMapping(value = "hello")
    public String hello() {
        return "Hello!";
    }

}
