package ${pkgName};

import io.mateu.ReferenceForPackageScanning;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration("${pkgName}.${simpleClassName}Config")
@ComponentScan(basePackageClasses = ReferenceForPackageScanning.class)
public class ${simpleClassName}Config {
}
