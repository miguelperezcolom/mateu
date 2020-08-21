package io.mateu.mdd.se.jms;

import com.rabbitmq.jms.admin.RMQDestination;

import javax.naming.NamingException;
import javax.naming.RefAddr;
import javax.naming.Reference;
import javax.naming.StringRefAddr;

public class MiTopic extends RMQDestination {

    public MiTopic() {
        setDestinationName(System.getProperty("mqtopicname", "mateutopic"));
        setAmqpExchangeName("jms.durable.topic");
        setAmqp(false);
        setQueue(false);
        setAmqpRoutingKey(System.getProperty("mqtopicname", "mateutopic"));
        setAmqpQueueName(System.getProperty("mqtopicname", "mateutopic"));
    }

    public Reference getReference() throws NamingException {
        Reference ref = new Reference(this.getClass().getCanonicalName(), MiTopicObjectFactory.class.getName(), null);
        addStringProperty(ref, "destinationName", getDestinationName());
        addBooleanProperty(ref, "amqp", isAmqp());
        addBooleanProperty(ref, "isQueue", isQueue());
        addStringProperty(ref, "amqpExchangeName", getAmqpExchangeName());
        addStringProperty(ref, "amqpRoutingKey", getAmqpRoutingKey());
        addStringProperty(ref, "amqpQueueName", getAmqpQueueName());

        return ref;
    }

    private static final void addStringProperty(Reference ref, String propertyName, String value) {
        if (value != null && propertyName != null) {
            RefAddr ra = new StringRefAddr(propertyName, value);
            ref.add(ra);
        }
    }

    private static final void addBooleanProperty(Reference ref, String propertyName, boolean value) {
        if (propertyName != null) {
            if (value) {
                RefAddr ra = new StringRefAddr(propertyName, String.valueOf(value));
                ref.add(ra);
            }

        }
    }

}
