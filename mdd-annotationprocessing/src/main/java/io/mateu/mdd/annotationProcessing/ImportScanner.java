package io.mateu.mdd.annotationProcessing;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import javax.lang.model.element.*;
import javax.lang.model.type.TypeKind;
import javax.lang.model.type.TypeMirror;
import javax.lang.model.util.ElementScanner7;

public class ImportScanner extends ElementScanner7<Void, Void> {

    private Set<String> types = new HashSet<>();

    public Set<String> getImportedTypes() {
        return types;
    }

    @Override
    public Void visitType(TypeElement e, Void p) {
        for(TypeMirror interfaceType : e.getInterfaces()) {
            types.add(interfaceType.toString());
        }
        types.add(e.getSuperclass().toString());
        return super.visitType(e, p);
    }

    @Override
    public Void visitExecutable(ExecutableElement e, Void p) {
        if(e.getReturnType().getKind() == TypeKind.DECLARED) {
            types.add(e.getReturnType().toString());
        }
        visitAnnotatios(e, p);
        return super.visitExecutable(e, p);
    }

    @Override
    public Void visitTypeParameter(TypeParameterElement e, Void p) {
        if(e.asType().getKind() == TypeKind.DECLARED) {
            types.add(e.asType().toString());
            visitAnnotatios(e, p);
        }
        return super.visitTypeParameter(e, p);
    }

    @Override
    public Void visitVariable(VariableElement e, Void p) {
        if(e.asType().getKind() == TypeKind.DECLARED) {
            types.add(e.asType().toString());
            visitAnnotatios(e, p);
        }
       return super.visitVariable(e, p);
    }

    @Override
    public Void visitUnknown(Element e, Void aVoid) {
        return super.visitUnknown(e, aVoid);
    }

    private void visitAnnotatios(Element e, Void p) {
        e.getAnnotationMirrors().forEach(m -> {
            types.add(m.getAnnotationType().toString());
            for (ExecutableElement executableElement : m.getElementValues().keySet()) {
                visit(executableElement, p);
                Object value = m.getElementValues().get(executableElement);
                if (value != null && value.getClass().getSimpleName().equals("Array")) {
                    AnnotationValue v = (AnnotationValue) value;
                    if (v.getValue() instanceof Collection) {
                        Collection c = (Collection) v.getValue();
                        for (Object o : c) {
                            types.add(o.toString().substring(0, o.toString().lastIndexOf(".")));
                        }
                    }
                }

            }
        });

    }

}