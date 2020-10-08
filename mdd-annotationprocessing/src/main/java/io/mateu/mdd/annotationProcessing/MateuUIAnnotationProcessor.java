package io.mateu.mdd.annotationProcessing;

import com.google.auto.service.AutoService;
import io.mateu.mdd.core.annotations.MateuUI;

import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Set;

@SupportedAnnotationTypes({"io.mateu.mdd.core.annotations.MateuUI"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
@AutoService(Processor.class)
public class MateuUIAnnotationProcessor extends AbstractProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        for (TypeElement annotation : annotations) {
            Set<? extends Element> annotatedElements = roundEnv.getElementsAnnotatedWith(annotation);

            for (Element e : annotatedElements) {
                String className = ((TypeElement) e).getQualifiedName().toString();
                String simpleClassName = ((TypeElement) e).getSimpleName().toString();

                System.out.println("MateuUIAnnotationProcessor running on " + simpleClassName);

                String generatedFullClassName = className + "Servlet";
                String pkgName = generatedFullClassName.substring(0, generatedFullClassName.lastIndexOf("."));
                String generatedClassName = generatedFullClassName.substring(generatedFullClassName.lastIndexOf(".") + 1);

                JavaFileObject builderFile = null;
                try {
                    builderFile = processingEnv.getFiler().createSourceFile(pkgName + "." + simpleClassName + "UI");
                    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
                        // writing generated file to out …

                        out.println("package " + pkgName + ";");
                        out.println("import " + className + ";");

                        out.println("import io.mateu.mdd.vaadin.MateuUI;");
                        out.println("import com.vaadin.annotations.*;");
                        out.println("import com.vaadin.annotations.JavaScript;");
                        out.println("import com.vaadin.navigator.PushStateNavigation;");
                        out.println("import lombok.extern.slf4j.Slf4j;");

                        out.println("");


                        out.println();
                        out.println("@Theme(\"" + e.getAnnotation(MateuUI.class).theme() + "\")\n" +
                                "@JavaScript({\"https://code.jquery.com/jquery-3.4.1.min.js\"})\n" +
                                //"@StyleSheet(\"https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.min.css\")\n" +
                                "@StyleSheet(\"https://use.fontawesome.com/releases/v5.14.0/js/all.js\")\n" +
                                //"@JavaScript({\"/js/include.js\"})\n" +
                                "@Viewport(\"width=device-width, initial-scale=1\")\n" +
                                "@PushStateNavigation // para urls sin #!\n" +
                                "//@Push\n" +
                                "@PreserveOnRefresh\n" +
                                "@Slf4j\n" +
                                "public class " + simpleClassName + "UI extends MateuUI {");
                        out.println("");
                        out.println("}");
                    }

                    builderFile = processingEnv.getFiler().createSourceFile(generatedFullClassName);
                    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
                        // writing generated file to out …

                        out.println("package " + pkgName + ";");
                        out.println("import " + className + ";");

                        out.println("import io.mateu.mdd.core.annotations.MateuUIServlet;");
                        out.println("import " + pkgName + "." + simpleClassName + "UI;");
                        out.println("import com.vaadin.annotations.VaadinServletConfiguration;");
                        out.println("import com.vaadin.server.DeploymentConfiguration;");
                        out.println("import com.vaadin.server.VaadinServlet;");

                        out.println("");

                        out.println("import javax.servlet.ServletConfig;");
                        out.println("import javax.servlet.ServletException;");
                        out.println("import javax.servlet.annotation.WebServlet;");
                        out.println("import java.util.Properties;");



                        out.println();
                        out.println("@WebServlet(urlPatterns = {\"" + e.getAnnotation(MateuUI.class).path() + "\", \"" + ("/".equals(e.getAnnotation(MateuUI.class).path())?"":e.getAnnotation(MateuUI.class).path()) + "/*\"}, name = \"" + className.replaceAll("\\.","_") + "UIServlet\", asyncSupported = true, loadOnStartup = 500)");
                        out.println("@VaadinServletConfiguration(ui = " + simpleClassName + "UI.class, productionMode = false)");
                        out.println("@MateuUIServlet(path=\"" + e.getAnnotation(MateuUI.class).path() + "\")");
                        out.println("public class " + generatedClassName + " extends VaadinServlet {");
                        out.println("");

                        out.println("    @Override");
                        out.println("    protected DeploymentConfiguration createDeploymentConfiguration(Properties initParameters) {");
                        out.println("        if (\"true\".equals(System.getProperty(\"productionMode\"))) initParameters.setProperty(\"productionMode\", Boolean.toString(true));");
                        out.println("        return super.createDeploymentConfiguration(initParameters);");
                        out.println("    }");

                        out.println("");

                        out.println("    @Override\n" +
                                "    public void init(ServletConfig servletConfig) throws ServletException {\n" +
                                "        servletConfig.getServletContext().setAttribute(\"" + ("".equals(e.getAnnotation(MateuUI.class).path())?"/":e.getAnnotation(MateuUI.class).path()) + "_app\", new " + className.substring(className.lastIndexOf(".") + 1) + "());\n" +
                                "        super.init(servletConfig);\n" +
                                "    }\n");


                        out.println("");
                        out.println("}");
                    }

                    builderFile = processingEnv.getFiler().createSourceFile(pkgName + "." + simpleClassName + "ServletFilter");
                    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
                        // writing generated file to out …

                        out.println("package " + pkgName + ";");

                        out.println("");

                        out.println("import io.mateu.security.web.MateuSecurityFilter;");
                        out.println("import javax.servlet.annotation.WebFilter;");

                        out.println("");


                        out.println();

                        String privatePath = e.getAnnotation(MateuUI.class).path();
                        if (!privatePath.endsWith("/")) privatePath += "/";
                        privatePath += "private/*";

                        out.println("@WebFilter(\"" + privatePath + "\")\n" +
                                "public class " + simpleClassName + "ServletFilter extends MateuSecurityFilter {");
                        out.println("");
                        out.println("}");
                    }

                } catch (IOException ex) {
                    ex.printStackTrace();
                }


            }
        }

        return true;
    }
}
