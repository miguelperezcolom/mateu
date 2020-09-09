package tests;

import graphql.ExecutionResult;
import graphql.GraphQL;
import graphql.schema.DataFetcher;
import graphql.schema.GraphQLSchema;
import graphql.schema.idl.*;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.workflow.WorkflowEngine;
import io.mateu.mdd.tester.model.entities.dependant.Country;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.Id;
import javax.persistence.metamodel.EntityType;
import java.io.PrintWriter;
import java.io.StringWriter;

import static graphql.schema.idl.RuntimeWiring.newRuntimeWiring;
import static graphql.schema.idl.TypeRuntimeWiring.newTypeWiring;

@Slf4j
public class GraphQLTester {

    public static void main(String[] args) {

        try {



            Helper.transact(em -> {
                Country u = new Country();
                u.setName("Mateu");
                em.persist(u);

                u = new Country();
                u.setName("Miguel");
                em.persist(u);
            });

            Helper.notransact(em -> {

                Helper.getStreams().streamAll(em, Country.class).forEach(c -> log.debug(c.getName()));


                String schema = crearSchema();

                log.debug(schema);


                SchemaParser schemaParser = new SchemaParser();
                TypeDefinitionRegistry typeDefinitionRegistry = schemaParser.parse(schema);

                RuntimeWiring runtimeWiring = crearRuntimeWiring();

                SchemaGenerator schemaGenerator = new SchemaGenerator();
                GraphQLSchema graphQLSchema = schemaGenerator.makeExecutableSchema(typeDefinitionRegistry, runtimeWiring);

                GraphQL build = GraphQL.newGraphQL(graphQLSchema).build();
                ExecutionResult executionResult = build.execute("{countryById(id: 1){id name}}");

                log.debug(executionResult.getData().toString());

                executionResult = build.execute("query Country{id name}");

                log.debug(executionResult.getData().toString());

            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        WorkflowEngine.exit(0);

    }

    private static RuntimeWiring crearRuntimeWiring() throws Throwable {
        RuntimeWiring.Builder b = RuntimeWiring.newRuntimeWiring();

        Helper.notransact(em -> {

            em.getMetamodel().getEntities().forEach(e -> {
                b.type("Query", builder -> builder.dataFetcher(e.getName().substring(0, 1).toLowerCase() + e.getName().substring(1) + "ById", getFieldDataFetcher(e, ReflectionHelper.getIdField(e.getJavaType()))));
            });


            em.getMetamodel().getEntities().forEach(e -> {
                for (FieldInterfaced f : ReflectionHelper.getAllFields(e.getJavaType())) {
                    if (soportado(f.getType())) {
                        b.type(TypeRuntimeWiring.newTypeWiring(e.getName()).dataFetcher(f.getName(), getFieldValueDataFetcher(e, f)));
                    }
                }
            });


        });

                //.type("Query", builder -> builder.dataFetcher("hello", new StaticDataFetcher("world")))
        return b.build();
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
                return Helper.selectObjects("select x from " + e.getName() + " x where x." + f.getName() + " = :f", Helper.hashmap("f", id)).stream().findFirst().orElse(null);
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

        Helper.notransact(em -> {

            pw.println("type Query {");
            em.getMetamodel().getEntities().forEach(e -> {
                pw.println(e.getName().substring(0, 1).toLowerCase() + e.getName().substring(1) + "ById(id: ID): " + e.getName());
            });
            pw.println("}");
            pw.println();


            em.getMetamodel().getEntities().forEach(e -> {
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
