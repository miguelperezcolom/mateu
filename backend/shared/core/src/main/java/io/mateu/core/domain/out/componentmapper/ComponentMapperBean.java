package io.mateu.core.domain.out.componentmapper;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.reflection.ComponentMapper;
import jakarta.inject.Named;
import lombok.RequiredArgsConstructor;

import java.util.Collection;
import java.util.List;

import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getContent;

@Named
@RequiredArgsConstructor
public class ComponentMapperBean implements ComponentMapper {

    @Override
    public Collection<? extends Component> mapToComponents(Object object) {
        return getContent(object, "", "/", "", null);
    }
}
