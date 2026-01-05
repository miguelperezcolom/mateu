package io.mateu.core.infra.declarative;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.CompositionRepository;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Repository;
import io.mateu.uidl.interfaces.StateSupplier;
import lombok.Getter;
import lombok.SneakyThrows;

import java.util.HashMap;
import java.util.List;

import static io.mateu.core.domain.out.componentmapper.ReflectionComponentMapper.mapToComponent;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.data.UICommand.pushStateToHistory;

@Getter
public class DynamicEditor extends GenericCrud implements ComponentTreeSupplier, StateSupplier {

    Class<?> entityType;
    Class<? extends Repository> repositoryClass;
    String foreignKeyField;
    Object _parentId;
    String _title;
    boolean _childCrud;

    public DynamicEditor(Class<?> entityType, Class<? extends Repository> repositoryClass, String foreignKeyField, Object _parentId, String _title, boolean _childCrud) {
        this.entityType = entityType;
        this.repositoryClass = repositoryClass;
        this.foreignKeyField = foreignKeyField;
        this._parentId = _parentId;
        this._title = _title;
        this._childCrud = _childCrud;
    }

    @Override
    public Object parentId() {
        return _parentId;
    }

    @Override
    public Repository repository() {
        return MateuBeanProvider.getBean(repositoryClass);
    }

    @Override
    public Class rowClass() {
        return entityType;
    }

    @Override
    public Class entityClass() {
        return entityType;
    }

    @Override
    public Class filtersClass() {
        return entityType;
    }

    @SneakyThrows
    @Override
    public Component component(HttpRequest httpRequest) {
        _show_detail = new HashMap<>();
        _editing = new HashMap<>();
        var parentId = parentId();
        var found = ((CompositionRepository)repository()).search(null, parentId, new Pageable(0, 10, List.of()));
        if (found.page().totalElements() == 0) {
            return new VerticalLayout(new Text("No element yet. Click on New to create one."), Button.builder()
                    .label("New")
                    .actionId("new")
                    .build());
        } else {
            var item = found.page().content().get(0);
            return viewComponent(item, httpRequest);
        }
    }

    @Override
    public List<Trigger> triggers() {
        return List.of();
    }

    @Override
    public String style() {
        return "width: 100%;";
    }

    @Override
    public String title() {
        return _title;
    }

    @Override
    public boolean childCrud() {
        return _childCrud;
    }

    @Override
    public boolean oneToOne() {
        return true;
    }

    @Override
    public Object state(HttpRequest httpRequest) {
        var parentId = parentId();
        var found = ((CompositionRepository)repository()).search(null, parentId, new Pageable(0, 10, List.of()));
        if (found.page().totalElements() > 0) {
            var item = found.page().content().get(0);
            var data = toMap();
            data.putAll(toMap(item));
            addRowNumber(data);
            return data;
        } else {
            var data = toMap();
            if ("".equals(foreignKeyField)) {
                data.put("id", parentId);
            } else {
                data.put(foreignKeyField, parentId);
            }
            addRowNumber(data);
            return data;
        }
        //return super.state(httpRequest);
    }
}
