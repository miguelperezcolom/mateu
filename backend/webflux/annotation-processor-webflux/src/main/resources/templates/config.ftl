package ${pkgName};

import org.springframework.context.annotation.Configuration;

// Mateu's own beans are registered by io.mateu.MateuAutoConfiguration (an auto-configuration of
// the adapter jar). No component scan here: scanning all of io.mateu swept in the beans of any
// third-party library living under io.mateu.*.
@Configuration("${pkgName}.${simpleClassName}Config")
public class ${simpleClassName}Config {
}
