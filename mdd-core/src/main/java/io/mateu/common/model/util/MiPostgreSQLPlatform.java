package io.mateu.common.model.util;

import com.rabbitmq.jms.admin.RMQConnectionFactory;
import com.rabbitmq.jms.admin.RMQDestination;
import io.mateu.mdd.core.model.util.MiTopic;
import io.mateu.mdd.core.model.util.MiTopicConnectionFactory;
import org.eclipse.jetty.jndi.NamingUtil;
import org.eclipse.persistence.internal.databaseaccess.FieldTypeDefinition;
import org.eclipse.persistence.platform.database.PostgreSQLPlatform;

import javax.jms.ConnectionFactory;
import javax.jms.Destination;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.naming.Reference;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Hashtable;

/**
 * Created by miguel on 13/10/16.
 */
public class MiPostgreSQLPlatform extends PostgreSQLPlatform {


    {

        Context context = null;
        try {
            context = new InitialContext();

            NamingUtil.bind(context, "java:comp/env/" + "jms/mateu", new MiTopicConnectionFactory());

            NamingUtil.bind(context, "java:comp/env/" + "jms/l2cache", new MiTopic()); //jmsDestination());

            context.close();


            Object o = new InitialContext().lookup("java:comp/env/jms/l2cache");

            if (o instanceof Reference) {
                System.out.println("Reference.getFactoryClassName()=" + ((Reference) o).getFactoryClassName());
            }

        } catch (NamingException e) {

            System.out.println("" + e.getClass().getName() + ":" + e.getMessage());

            if (e.getMessage() == null || e.getMessage().contains("inmutable")) {

                System.out.println("No hay contexto inicial. Reintentamos...");

                System.setProperty("java.naming.factory.initial", "org.osjava.sj.SimpleContextFactory");

                System.out.println("INICIALIZANDO JMS...");


                try {
                    context = new InitialContext();

                    context.rebind("java:comp/env/" + "jms/mateu", jmsConnectionFactory());

                    context.rebind("java:comp/env/" + "jms/l2cache", new RMQDestination(System.getProperty("mqtopicname", "mateutopic"), false, false)); //jmsDestination());

                    context.close();

                } catch (NamingException ex) {
                    ex.printStackTrace();
                }
            }

        }


    }

    private static ConnectionFactory jmsConnectionFactory() {
        RMQConnectionFactory connectionFactory = new RMQConnectionFactory();
        connectionFactory.setUsername("tester");
        connectionFactory.setPassword("tester8912");
        connectionFactory.setVirtualHost("/");
        connectionFactory.setHost("quon.mateu.io");
        return connectionFactory;
    }

    private static Destination jmsDestination() {
        RMQDestination jmsDestination = new RMQDestination();
        jmsDestination.setDestinationName("quo1");
        jmsDestination.setAmqpExchangeName("jms.durable.topic");
        jmsDestination.setAmqp(true);
        //jmsDestination.setAmqpQueueName("quo2");
        return jmsDestination;
    }





    public MiPostgreSQLPlatform() {
        super();
    }

    @Override
    protected Hashtable buildFieldTypes() {
        Hashtable t = super.buildFieldTypes();
        t.put(String.class, new FieldTypeDefinition("TEXT", false));
        t.put(LocalDate.class, new FieldTypeDefinition("DATE", false));
        t.put(LocalDateTime.class, new FieldTypeDefinition("TIMESTAMP WITHOUT TIME ZONE", false));

        return t;
    }
}
