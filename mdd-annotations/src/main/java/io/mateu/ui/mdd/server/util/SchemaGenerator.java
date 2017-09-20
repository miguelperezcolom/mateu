package io.mateu.ui.mdd.server.util;

import javax.persistence.Persistence;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by miguel on 2/10/16.
 */
public class SchemaGenerator {

    public static void main(String... args) {

        Map<String, Object> properties = new HashMap<String, Object>();

        Persistence.generateSchema("default", null);

    }

}
