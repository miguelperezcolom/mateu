package io.mateu.mdd.core.test;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.tests.Persona;
import javassist.ClassClassPath;
import javassist.ClassPool;

public class TestJavassist {

    public static void main(String[] args) {

        ClassPool cpool = ClassPool.getDefault();
        cpool.appendClassPath(new ClassClassPath(Persona.class));
        MDD.setClassPool(cpool);

        try {
            System.out.println(ReflectionHelper.createClass("zzzz", ReflectionHelper.getAllFields(ReflectionHelper.getMethod(TestJavassistModel.class, "metodo")), false));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
