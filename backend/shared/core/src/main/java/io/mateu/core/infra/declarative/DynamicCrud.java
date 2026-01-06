package io.mateu.core.infra.declarative;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.CompositionRepository;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Repository;
import lombok.Getter;

@Getter
public class DynamicCrud extends GenericCrud implements ComponentTreeSupplier {

  Class<?> entityType;
  Class<? extends Repository> repositoryClass;
  String foreignKeyField;
  Object _parentId;
  String _title;
  boolean _childCrud;

  public DynamicCrud(
      Class<?> entityType,
      Class<? extends Repository> repositoryClass,
      String foreignKeyField,
      Object _parentId,
      String _title,
      boolean _childCrud) {
    this.entityType = entityType;
    this.repositoryClass = repositoryClass;
    this.foreignKeyField = foreignKeyField;
    this._parentId = _parentId;
    this._title = _title;
    this._childCrud = _childCrud;
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

  @Override
  public Component component(HttpRequest httpRequest) {
    return list(httpRequest);
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
  public Object parentId() {
    return _parentId;
  }

  @Override
  public ListingData search(String searchText, Pageable pageable) {
    return ((CompositionRepository) repository()).search(searchText, parentId(), pageable);
  }
}
