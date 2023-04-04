package io.mateu.util;

import io.mateu.util.asciiart.Painter;
import io.mateu.util.beanutils.MiURLConverter;
import io.mateu.util.exceptions.MoreThanOneImplementationFound;
import io.mateu.util.exceptions.NoImplementationFound;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.beanutils.ConvertUtils;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
public class SharedHelper {

    public static boolean propertiesLoaded = false;

    public static void loadProperties() {
        if (!propertiesLoaded) {



            Painter.paint("Hello");
            Painter.paint("MATEU");



            log.info("Registrando concerters beanutils...");
            ConvertUtils.register(new MiURLConverter(), URL.class);

            log.info("Loading properties...");
            propertiesLoaded = true;
            InputStream s = null;
            try {
                if (System.getProperty("appconf") != null) {
                    log.info("Loading properties from file " + System.getProperty("appconf"));
                    s = new FileInputStream(System.getProperty("appconf"));
                } else {
                    s = SharedHelper.class.getResourceAsStream("/appconf.properties");
                    log.info("Loading properties classpath /appconf.properties");
                }

                if (s != null) {

                    Properties p = new Properties();
                    p.load(s);

                    for (Map.Entry<Object, Object> e : p.entrySet()) {
                        log.info("" + e.getKey() + "=" + e.getValue());
                        if (System.getProperty("" + e.getKey()) == null) {
                            System.setProperty("" + e.getKey(), "" + e.getValue());
                            log.debug("property fixed");
                        } else {
                            log.info("property " + e.getKey() + " is already set with value " + System.getProperty("" + e.getKey()));
                        }
                    }

                    if (System.getProperty("heroku.database.url") != null) {

                        log.info("adjusting jdbc properties for Heroku...");

                        URI dbUri = null;
                        try {
                            dbUri = new URI(System.getProperty("heroku.database.url"));
                        } catch (URISyntaxException e) {
                            e.printStackTrace();
                        }


                        System.setProperty("eclipselink.target-database", "io.mateu.mdd.se.postgresql.MiPostgreSQLPlatform");
                        System.setProperty("jakarta.persistence.jdbc.driver", "org.postgresql.Driver");

                        String username = dbUri.getUserInfo().split(":")[0];
                        String password = dbUri.getUserInfo().split(":")[1];
                        String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath() + "?sslmode=require&user=" + username + "&password=" + password;


                        System.setProperty("jakarta.persistence.jdbc.url", dbUrl);
                        System.getProperties().remove("jakarta.persistence.jdbc.user");
                        System.getProperties().remove("jakarta.persistence.jdbc.password");


                    } else if (System.getProperty("jakarta.persistence.jdbc.url", "").contains("postgres")) {
                        System.setProperty("eclipselink.target-database", "io.mateu.mdd.se.postgresql.MiPostgreSQLPlatform");
                    }
                    s.close();
                } else {
                    log.error("No appconf. Either set -Dappconf=xxxxxx.properties or place an appconf.properties file in your classpath.");
                }

            } catch (FileNotFoundException e1) {
                e1.printStackTrace();
            } catch (IOException e1) {
                e1.printStackTrace();
            }

        } else {
            log.info("Properties already loaded");
        }
    }


    /**
     * look for implementation using the service loader (checks only 1 implementation exists)
     * @param anInterface the interface to look for
     * @param <T> the actual type
     * @return implementation
     * @throws Exception in case of not found or there
     */
    public static <T> T getImpl(Class<T> anInterface) throws Exception {
        List<T> impls = getImpls(anInterface);
        if (impls.size() == 0) throw new NoImplementationFound(anInterface);
        if (impls.size() > 1) throw new MoreThanOneImplementationFound(anInterface, impls);
        return impls.get(0);
    }

    /**
     * look for implementations using the service loader
     *
     * @param anInterface the interface to look for
     * @param <T> the actual type
     * @return list of implementations
     */
    public static <T> List<T> getImpls(Class<T> anInterface) {
        return ServiceLoader.load(anInterface).stream()
                .map(p -> p.get()).collect(Collectors.toList());
    }

}
