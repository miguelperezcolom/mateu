package io.mateu.dtos;

import java.util.List;
import java.util.Map;

/**
 * A common interface for componentIds
 */
public interface Component {

    ComponentMetadata metadata();
    String id();
    Map<String, Object> attributes();
    Map<String, Object> data();
    List<String> childComponentIds();

}
