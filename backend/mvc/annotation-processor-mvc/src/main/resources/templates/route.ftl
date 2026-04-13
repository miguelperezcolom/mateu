package ${pkgName};

import io.mateu.uidl.interfaces.RoutedClassProvider;
import jakarta.inject.Named;

@Named
public class ${generatedClassName} implements RoutedClassProvider {

    @Override
    public Class<?> routedClass() {
        return ${simpleClassName}.class;
    }

}
