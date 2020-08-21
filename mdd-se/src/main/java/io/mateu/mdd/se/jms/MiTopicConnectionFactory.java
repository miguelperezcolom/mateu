package io.mateu.mdd.se.jms;

import com.rabbitmq.jms.admin.RMQConnectionFactory;

import javax.jms.Connection;
import javax.jms.JMSException;
import javax.jms.TopicConnection;
import javax.jms.TopicConnectionFactory;

public class MiTopicConnectionFactory implements TopicConnectionFactory {

    private static RMQConnectionFactory f = jmsConnectionFactory();

    private static RMQConnectionFactory jmsConnectionFactory() {
        RMQConnectionFactory connectionFactory = new RMQConnectionFactory();
        connectionFactory.setUsername(System.getProperty("mqusername", "mateu"));
        connectionFactory.setPassword(System.getProperty("mqpassword", "xx"));
        connectionFactory.setVirtualHost("/");
        connectionFactory.setHost(System.getProperty("mqhost", "mq.mateu.io"));
        return connectionFactory;
    }

    @Override
    public TopicConnection createTopicConnection() throws JMSException {
        return f.createTopicConnection();
    }

    @Override
    public TopicConnection createTopicConnection(String s, String s1) throws JMSException {
        return f.createTopicConnection(s, s1);
    }

    @Override
    public Connection createConnection() throws JMSException {
        return f.createConnection();
    }

    @Override
    public Connection createConnection(String s, String s1) throws JMSException {
        return f.createConnection(s, s1);
    }
}
