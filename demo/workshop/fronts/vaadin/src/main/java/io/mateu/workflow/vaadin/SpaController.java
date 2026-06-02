package io.mateu.workflow.vaadin;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({"/{path:[^\\.]*}", "/**/{path:[^\\.]*}"})
    public String spa() {
        return "forward:/index.html";
    }
}
