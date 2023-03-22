package ${pkgName};

import io.mateu.remote.domain.UIRegistry;
import io.mateu.util.Helper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.annotation.PostConstruct;


@RestController
@RequestMapping("/")
@Slf4j
public class ${simpleClassName}Controller {

    @GetMapping(value = "", produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex(HttpServletRequest request) {
        String[] tokens = request.getRequestURI().split(request.getContextPath());
        String path = tokens.length > 1?tokens[1]:"";
        String html = Helper.leerFichero(this.getClass(), "/npm/mateu/index.html");
        html = html.replaceAll("http:\\/\\/localhost:8081\\/mateu\\/v1", "/mateu/v1");
        html = html.replaceAll("com\\.example\\.demoremote\\.ui\\.DemoApp", "${className}");
        return html;
    }

    @PostConstruct
    public void init() {
        try {
            UIRegistry.add(Class.forName("${className}"));
        } catch (ClassNotFoundException e) {
            log.error("Unable to find class ${className} for UI registration");
        }
    }

}
