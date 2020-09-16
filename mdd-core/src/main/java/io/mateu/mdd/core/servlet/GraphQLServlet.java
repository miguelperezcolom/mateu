package io.mateu.mdd.core.servlet;

import graphql.schema.DataFetcher;
import graphql.schema.GraphQLSchema;
import graphql.schema.idl.RuntimeWiring;
import graphql.schema.idl.SchemaGenerator;
import graphql.schema.idl.SchemaParser;
import graphql.schema.idl.TypeDefinitionRegistry;
import graphql.servlet.GraphQLConfiguration;
import graphql.servlet.GraphQLHttpServlet;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.JPAHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.Id;
import javax.persistence.metamodel.EntityType;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import static graphql.schema.idl.RuntimeWiring.newRuntimeWiring;
import static graphql.schema.idl.TypeRuntimeWiring.newTypeWiring;

@WebServlet(name = "GraphQLServlet", urlPatterns = {"/graphql/*"})
public class GraphQLServlet extends GraphQLHttpServlet {

    //for Preflight
    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setAccessControlHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    private void setAccessControlHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Headers", "*");
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "*");
    }

    private GraphQLSchema graphQLSchema;

    public GraphQLServlet() {

        Logger l = LoggerFactory.getLogger("graphql");

        if ("true".equalsIgnoreCase(System.getProperty("graphql"))) {

            log.debug(l.getClass().getName());

            try {
                String schema = crearSchema();

                log.debug(schema);


                SchemaParser schemaParser = new SchemaParser();
                TypeDefinitionRegistry typeDefinitionRegistry = schemaParser.parse(schema);

                RuntimeWiring runtimeWiring = crearRuntimeWiring();

                SchemaGenerator schemaGenerator = new SchemaGenerator();
                graphQLSchema = schemaGenerator.makeExecutableSchema(typeDefinitionRegistry, runtimeWiring);

            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }

        }

    }


    @Override
    protected GraphQLConfiguration getConfiguration() {
        return GraphQLConfiguration.with(createSchema()).build();
    }

    private GraphQLSchema createSchema() {
        return graphQLSchema;
    }

    private static RuntimeWiring crearRuntimeWiring() throws Throwable {
        RuntimeWiring.Builder b = newRuntimeWiring();

        JPAHelper.notransact(em -> {

            em.getMetamodel().getEntities().forEach(e -> {
                if (utilizable(e)) b.type("Query", builder -> builder.dataFetcher(e.getName().substring(0, 1).toLowerCase() + e.getName().substring(1) + "ById", getFieldDataFetcher(e, ReflectionHelper.getIdField(e.getJavaType()))));
            });


            em.getMetamodel().getEntities().forEach(e -> {
                if (utilizable(e)) for (FieldInterfaced f : ReflectionHelper.getAllFields(e.getJavaType())) {
                    if (soportado(f.getType())) {
                        b.type(newTypeWiring(e.getName()).dataFetcher(f.getName(), getFieldValueDataFetcher(e, f)));
                    }
                }
            });


        });

        //.type("Query", builder -> builder.dataFetcher("hello", new StaticDataFetcher("world")))
        return b.build();
    }

    private static boolean utilizable(EntityType<?> e) {
        boolean ok = false;
        for (FieldInterfaced f : ReflectionHelper.getAllFields(e.getJavaType())) {
            if (soportado(f.getType())) {
                ok = true;
                break;
            }
        }
        return ok;
    }

    private static DataFetcher getFieldValueDataFetcher(EntityType<?> e, FieldInterfaced f) {
        return dataFetchingEnvironment -> {
            return ReflectionHelper.getValue(f, dataFetchingEnvironment.getSource());
        };
    }

    public static DataFetcher getFieldDataFetcher(EntityType<?> e, FieldInterfaced f) {
        return dataFetchingEnvironment -> {
            Object id = getValueForField(f, dataFetchingEnvironment.getArgument("id"));
            try {
                return JPAHelper.selectObjects("select x from " + e.getName() + " x where x." + f.getName() + " = :f", Helper.hashmap("f", id)).stream().findFirst().orElse(null);
            } catch (Throwable t) {
                t.printStackTrace();
                return null;
            }
        };
    }

    private static Object getValueForField(FieldInterfaced f, Object v) {
        if (v == null) return null;
        Object r = v;
        if (String.class.equals(f.getType())) r = "" + v;
        if (Long.class.equals(f.getType()) || long.class.equals(f.getType())) r = Long.parseLong("" + v);
        if (Integer.class.equals(f.getType()) || int.class.equals(f.getType())) r = Double.parseDouble("" + v);
        if (Double.class.equals(f.getType()) || double.class.equals(f.getType())) r = Integer.parseInt("" + v);
        if (Boolean.class.equals(f.getType()) || boolean.class.equals(f.getType())) r = Boolean.parseBoolean("" + v);
        return r;
    }


    private static String crearSchema() throws Throwable {

        StringWriter sw;
        PrintWriter pw = new PrintWriter(sw = new StringWriter());

        JPAHelper.notransact(em -> {

            pw.println("type Query {");
            em.getMetamodel().getEntities().forEach(e -> {
                if (utilizable(e)) pw.println(e.getName().substring(0, 1).toLowerCase() + e.getName().substring(1) + "ById(id: ID): " + e.getName());
            });
            pw.println("}");
            pw.println();


            em.getMetamodel().getEntities().forEach(e -> {

                if (utilizable(e)) {
                    pw.println("type " + e.getName() + " {");

                /*
                                        "  id: ID\n" +
                        "  name: String\n" +
                        "  pageCount: Int\n" +
                        "  author: Author\n" +

                 */

                    for (FieldInterfaced f : ReflectionHelper.getAllFields(e.getJavaType())) {
                        if (soportado(f.getType())) {
                            pw.println(" " + f.getName() + ": " + getTipo(f));
                        }
                    }

                    pw.println("}");
                    pw.println();
                }

            });


        });

        return sw.toString();
    }

    private static String getTipo(FieldInterfaced f) {
        if (f.isAnnotationPresent(Id.class)) return "ID";
        Class<?> type = f.getType();
        if (String.class.equals(type)) return "String";
        if (long.class.equals(type)) return "Int";
        if (int.class.equals(type)) return "Int";
        if (double.class.equals(type)) return "Float";
        if (boolean.class.equals(type)) return "Boolean";
        return null;
    }

    private static boolean soportado(Class<?> type) {
        if (String.class.equals(type)) return true;
        if (long.class.equals(type)) return true;
        if (int.class.equals(type)) return true;
        if (double.class.equals(type)) return true;
        if (boolean.class.equals(type)) return true;
        return false;
    }
}