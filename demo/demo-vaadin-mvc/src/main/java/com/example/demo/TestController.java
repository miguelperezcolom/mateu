package com.example.demo;


import io.mateu.SpringHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@CrossOrigin
@RestController()
@RequestMapping("/test")
@Slf4j
@RequiredArgsConstructor
public class TestController {

    @GetMapping("v3/**")
    public Mono<String> runStep(
            HttpServletRequest request) throws Throwable {
        // /test/v3/xx/yy
        return Mono.just(request.getRequestURI()
                .split(request.getContextPath() + "/v3/")[1]);
    }


}
