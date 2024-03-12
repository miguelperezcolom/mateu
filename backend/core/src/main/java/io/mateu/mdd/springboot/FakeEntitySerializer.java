package io.mateu.mdd.springboot;

import io.mateu.util.persistence.EntitySerializer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@ConditionalOnMissingBean(type = "EntitySerializer")
public class FakeEntitySerializer implements EntitySerializer {
    @Override
    public Map<String, Object> toMap(Object entity) throws Exception {
        return null;
    }
}
