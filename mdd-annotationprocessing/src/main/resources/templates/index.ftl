package ${pkgName};

import io.mateu.remote.domain.UIRegistry;
import io.mateu.util.Helper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.PostConstruct;


@RestController
@RequestMapping("${path}")
@Slf4j
public class ${simpleClassName}Controller {

    @GetMapping(value = "", produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex() {
        String html = Helper.leerFichero(this.getClass(), "/npm/mateu/index.html");
<#list externalScripts as x>
        html = html.replaceAll("<title>AQUIELTITULODELAPAGINA</title>", "<script type=\"module\" src=\"${x}\"></script><title>AQUIELTITULODELAPAGINA</title>");
</#list>
        html = html.replaceAll("AQUIELTITULODELAPAGINA", "${caption}");
        html = html.replaceAll("http:\\/\\/localhost:8081\\/mateu\\/v1", "/mateu/v1");
        html = html.replaceAll("com\\.example\\.demoremote\\.ui\\.demoApp\\.DemoApp", "${className}");
        return html;
    }

    @Autowired
    UIRegistry uiRegistry;

    @PostConstruct
    public void init() {
        try {
            uiRegistry.add(Class.forName("${className}"));
        } catch (ClassNotFoundException e) {
            log.error("Unable to find class ${className} for UI registration");
        }
    }

}
