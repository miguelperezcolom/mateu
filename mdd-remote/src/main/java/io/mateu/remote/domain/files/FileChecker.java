package io.mateu.remote.domain.files;

import io.mateu.mdd.shared.annotations.File;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FileChecker {

    public boolean isFile(FieldInterfaced field) {
        return java.io.File.class.equals(field.getType())
                || java.io.File[].class.equals(field.getType())
                || java.io.File.class.equals(ReflectionHelper.getGenericClass(field, List.class, "E"))
                || field.isAnnotationPresent(File.class);
    }

}
