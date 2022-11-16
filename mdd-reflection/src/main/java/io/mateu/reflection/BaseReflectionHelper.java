package io.mateu.reflection;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class BaseReflectionHelper {

    static List<Class> basicos = new ArrayList<>();

    static {
        basicos.add(String.class);
        basicos.add(Integer.class);
        basicos.add(Long.class);
        basicos.add(Double.class);
        basicos.add(Boolean.class);
        basicos.add(LocalDate.class);
        basicos.add(LocalDateTime.class);
        basicos.add(LocalTime.class);
        basicos.add(int.class);
        basicos.add(long.class);
        basicos.add(double.class);
        basicos.add(boolean.class);
    }

    public static boolean isBasico(Class c) {
        return basicos.contains(c);
    }

    public static boolean isBasico(Object o) {
        return isBasico(o.getClass());
    }


}
