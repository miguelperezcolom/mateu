package io.mateu.mdd.annotationProcessing;

import com.google.auto.service.AutoService;
import io.mateu.mdd.core.annotations.MateuMDDUI;

import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Set;

@SupportedAnnotationTypes("io.mateu.mdd.core.annotations.MateuMDDUI")
@SupportedSourceVersion(SourceVersion.RELEASE_8)
@AutoService(Processor.class)
public class MateuMDDAnnotationProcessor extends AbstractProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        for (TypeElement annotation : annotations) {
            Set<? extends Element> annotatedElements = roundEnv.getElementsAnnotatedWith(annotation);

            for (Element e : annotatedElements) {
                String className = ((TypeElement) e).getQualifiedName().toString();
                String simpleClassName = ((TypeElement) e).getSimpleName().toString();

                String generatedFullClassName = className + "Servlet";
                String pkgName = generatedFullClassName.substring(0, generatedFullClassName.lastIndexOf("."));
                String generatedClassName = generatedFullClassName.substring(generatedFullClassName.lastIndexOf(".") + 1);

                JavaFileObject builderFile = null;
                try {
                    builderFile = processingEnv.getFiler().createSourceFile(pkgName + "." + simpleClassName + "MDDUI");
                    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
                        // writing generated file to out …

                        out.println("package " + pkgName + ";");
                        out.println("import " + className + ";");

                        out.println("import io.mateu.mdd.vaadinport.vaadin.MDDUI;");
                        out.println("import com.vaadin.annotations.*;");
                        out.println("import com.vaadin.annotations.JavaScript;");
                        out.println("import com.vaadin.navigator.PushStateNavigation;");
                        out.println("import lombok.extern.slf4j.Slf4j;");

                        out.println("");


                        out.println();
                        out.println("@Theme(\"" + e.getAnnotation(MateuMDDUI.class).theme() + "\")\n" +
                                "@JavaScript({\"https://code.jquery.com/jquery-3.4.1.min.js\"})\n" +
                                "@StyleSheet(\"https://use.fontawesome.com/releases/v5.13.0/css/all.css\")\n" +
                                "@Viewport(\"width=device-width, initial-scale=1\")\n" +
                                "@PushStateNavigation // para urls sin #!\n" +
                                "//@Push\n" +
                                "@PreserveOnRefresh\n" +
                                "@Slf4j\n" +
                                "public class " + simpleClassName + "MDDUI extends MDDUI {");
                        out.println("");
                        out.println("}");
                    }

                    builderFile = processingEnv.getFiler().createSourceFile(generatedFullClassName);
                    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
                        // writing generated file to out …

                        out.println("package " + pkgName + ";");
                        out.println("import " + className + ";");

                        out.println("import io.mateu.mdd.vaadinport.vaadin.MDDUI;");
                        out.println("import " + pkgName + "." + simpleClassName + "MDDUI;");
                        out.println("import com.vaadin.annotations.VaadinServletConfiguration;");
                        out.println("import com.vaadin.server.DeploymentConfiguration;");
                        out.println("import com.vaadin.server.VaadinServlet;");

                        out.println("");

                        out.println("import javax.servlet.ServletConfig;");
                        out.println("import javax.servlet.ServletException;");
                        out.println("import javax.servlet.annotation.WebServlet;");
                        out.println("import java.util.Properties;");



                        out.println();
                        out.println("@WebServlet(urlPatterns = {\"" + e.getAnnotation(MateuMDDUI.class).path() + "\", \"" + ("/".equals(e.getAnnotation(MateuMDDUI.class).path())?"":e.getAnnotation(MateuMDDUI.class).path()) + "/*\"}, name = \"" + className.replaceAll("\\.","_") + "UIServlet\", asyncSupported = true, loadOnStartup = 500)");
                        out.println("@VaadinServletConfiguration(ui = " + simpleClassName + "MDDUI.class, productionMode = false)");
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
                                "        servletConfig.getServletContext().setAttribute(\"" + ("".equals(e.getAnnotation(MateuMDDUI.class).path())?"/":e.getAnnotation(MateuMDDUI.class).path()) + "_app\", new " + className.substring(className.lastIndexOf(".") + 1) + "());\n" +
                                "        super.init(servletConfig);\n" +
                                "    }\n");


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
