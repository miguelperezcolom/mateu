package io.mateu.core.domain.model.reflection.usecases;

import org.reflections.Reflections;
import org.springframework.stereotype.Service;

import java.lang.reflect.Modifier;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

@Service
public class SubclassProvider {

    public Set<Class> getSubclasses(Class c) {
        String pkg = c.getPackage().getName();
        String[] ts = pkg.split("\\.");
        if (ts.length > 3) {
            pkg = ts[0] + "." + ts[1] + "." + ts[2];
        }
        Reflections reflections = new Reflections(pkg);

        Set<Class> subs = reflections.getSubTypesOf(c);

        Set<Class> subsFiltered =
                new TreeSet<>((a, b) -> a.getSimpleName().compareTo(b.getSimpleName()));
        subsFiltered.addAll(
                subs.stream()
                        .filter(s -> !Modifier.isAbstract(s.getModifiers()))
                        .collect(Collectors.toSet()));

        return subsFiltered;
    }

}
