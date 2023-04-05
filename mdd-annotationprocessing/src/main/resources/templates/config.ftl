package ${pkgName};

import io.mateu.ReferenceForPackageScanning;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan(basePackageClasses = ReferenceForPackageScanning.class)
public class ${simpleClassName}Config {
}
