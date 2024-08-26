package io.mateu.core.domain.model.reflection;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.editors.ObjectEditor;
import io.mateu.core.domain.model.outbound.Humanizer;
import io.mateu.core.domain.model.outbound.i18n.Translator;
import io.mateu.core.domain.model.reflection.fieldabstraction.FieldFactory;
import io.mateu.core.domain.model.reflection.usecases.*;
import io.mateu.core.domain.model.util.beanutils.MiURLConverter;
import java.lang.reflect.*;
import java.net.URL;
import java.util.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.beanutils.ConvertUtils;
import org.apache.commons.beanutils.converters.BooleanConverter;
import org.apache.commons.beanutils.converters.DoubleConverter;
import org.apache.commons.beanutils.converters.IntegerConverter;
import org.apache.commons.beanutils.converters.LongConverter;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class ReflectionHelper {

  final ValueProvider valueProvider;
  final BasicTypeChecker basicTypeChecker;
  final Translator translator;
  final FieldFactory fieldFactory;
  final Humanizer humanizer;
  private final GetterProvider getterProvider;
  private final SetterProvider setterProvider;
  private final ValueWriter valueWriter;
  private final FieldByNameProvider fieldByNameProvider;
  private final AllFieldsProvider allFieldsProvider;
  private final MethodProvider methodProvider;
  private final AllMethodsProvider allMethodsProvider;
  private final IdFieldProvider idFieldProvider;
  private final IdProvider idProvider;
  private final VersionFieldProvider versionFieldProvider;
  private final NameFieldProvider nameFieldProvider;
  private final MapperFieldProvider mapperFieldProvider;
  private final GenericClassProvider genericClassProvider;
  private final TypeProvider typeProvider;
  private final AllEditableFieldsProvider allEditableFieldsProvider;
  private final AllTransferrableFieldsProvider allTransferrableFieldsProvider;
  private final SubclassProvider subclassProvider;
  private final ObjectCopier objectCopier;
  private final InstanceProvider instanceProvider;
  private final ActualValueExtractor actualValueExtractor;

  Map<Class, List<io.mateu.core.domain.model.reflection.fieldabstraction.Field>> allFieldsCache =
      new HashMap<>();
  Map<Class, List<Method>> allMethodsCache = new HashMap<>();
  Map<String, Method> methodCache = new HashMap<>();
  private ObjectMapper mapper = new ObjectMapper();

  public ReflectionHelper(
      ValueProvider valueProvider,
      BasicTypeChecker basicTypeChecker,
      Translator translator,
      FieldFactory fieldFactory,
      Humanizer humanizer,
      GetterProvider getterProvider,
      SetterProvider setterProvider,
      ValueWriter valueWriter,
      FieldByNameProvider fieldByNameProvider,
      AllFieldsProvider allFieldsProvider,
      MethodProvider methodProvider,
      AllMethodsProvider allMethodsProvider,
      IdFieldProvider idFieldProvider,
      IdProvider idProvider,
      VersionFieldProvider versionFieldProvider,
      NameFieldProvider nameFieldProvider,
      MapperFieldProvider mapperFieldProvider,
      GenericClassProvider genericClassProvider,
      TypeProvider typeProvider,
      AllEditableFieldsProvider allEditableFieldsProvider,
      AllTransferrableFieldsProvider allTransferrableFieldsProvider,
      SubclassProvider subclassProvider,
      ObjectCopier objectCopier,
      InstanceProvider instanceProvider,
      ActualValueExtractor actualValueExtractor) {
    this.valueProvider = valueProvider;
    this.basicTypeChecker = basicTypeChecker;
    this.translator = translator;
    this.fieldFactory = fieldFactory;
    this.humanizer = humanizer;
    ConvertUtils.register(new IntegerConverter(null), Integer.class);
    ConvertUtils.register(new LongConverter(null), Long.class);
    ConvertUtils.register(new DoubleConverter(null), Double.class);
    ConvertUtils.register(new BooleanConverter(null), Boolean.class);
    ConvertUtils.register(new MiURLConverter(), URL.class);
    this.getterProvider = getterProvider;
    this.setterProvider = setterProvider;
    this.valueWriter = valueWriter;
    this.fieldByNameProvider = fieldByNameProvider;
    this.allFieldsProvider = allFieldsProvider;
    this.methodProvider = methodProvider;
    this.allMethodsProvider = allMethodsProvider;
    this.idFieldProvider = idFieldProvider;
    this.idProvider = idProvider;
    this.versionFieldProvider = versionFieldProvider;
    this.nameFieldProvider = nameFieldProvider;
    this.mapperFieldProvider = mapperFieldProvider;
    this.genericClassProvider = genericClassProvider;
    this.typeProvider = typeProvider;
    this.allEditableFieldsProvider = allEditableFieldsProvider;
    this.allTransferrableFieldsProvider = allTransferrableFieldsProvider;
    this.subclassProvider = subclassProvider;
    this.objectCopier = objectCopier;
    this.instanceProvider = instanceProvider;
    this.actualValueExtractor = actualValueExtractor;
  }

  public boolean isBasic(Class c) {
    return basicTypeChecker.isBasic(c);
  }

  public boolean isBasic(Object o) {
    return basicTypeChecker.isBasic(o);
  }

  public Object getValue(java.lang.reflect.Field f, Object o) {
    return valueProvider.getValue(f, o);
  }

  public void setValue(
      io.mateu.core.domain.model.reflection.fieldabstraction.Field f, Object o, Object v)
      throws InvocationTargetException, IllegalAccessException, NoSuchMethodException {
    valueWriter.setValue(f, o, v);
  }

  public void setValue(String fn, Object o, Object v)
      throws InvocationTargetException, IllegalAccessException, NoSuchMethodException {
    valueWriter.setValue(fn, o, v);
  }

  public Object getValue(
      io.mateu.core.domain.model.reflection.fieldabstraction.Field f,
      Object o,
      Object valueIfNull) {
    return valueProvider.getValue(f, o, valueIfNull);
  }

  public Object getValue(io.mateu.core.domain.model.reflection.fieldabstraction.Field f, Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
    return valueProvider.getValue(f, o);
  }

  public Object getValue(AnnotatedElement e, Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
    return valueProvider.getValue(e, o);
  }

  public Object getValue(String id, Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
    return valueProvider.getValue(id, o);
  }

  public Method getMethod(Class<?> c, String methodName) {
    return methodProvider.getMethod(c, methodName);
  }

  public List<Method> getAllMethods(Class c) {
    return allMethodsProvider.getAllMethods(c);
  }

  public List<io.mateu.core.domain.model.reflection.fieldabstraction.Field> getAllFields(Class c) {
    return allFieldsProvider.getAllFields(c);
  }

  public List<io.mateu.core.domain.model.reflection.fieldabstraction.Field> getAllFields(Method m) {
    return allFieldsProvider.getAllFields(m);
  }

  public Object getId(Object model) {
    return idProvider.getId(model);
  }

  public io.mateu.core.domain.model.reflection.fieldabstraction.Field getIdField(Class type) {
    return idFieldProvider.getIdField(type);
  }

  public java.lang.reflect.Field getVersionField(Class c) {
    return versionFieldProvider.getVersionField(c);
  }

  public io.mateu.core.domain.model.reflection.fieldabstraction.Field getNameField(
      Class entityClass, boolean toStringPreferred) {
    return nameFieldProvider.getNameField(entityClass, toStringPreferred);
  }

  public io.mateu.core.domain.model.reflection.fieldabstraction.Field getFieldByName(
      Class sourceClass, String fieldName) {
    return fieldByNameProvider.getFieldByName(sourceClass, fieldName);
  }

  public io.mateu.core.domain.model.reflection.fieldabstraction.Field getMapper(
      io.mateu.core.domain.model.reflection.fieldabstraction.Field field) {
    return mapperFieldProvider.getMapper(field);
  }

  public Class getGenericClass(
      io.mateu.core.domain.model.reflection.fieldabstraction.Field field,
      Class asClassOrInterface,
      String genericArgumentName) {
    return genericClassProvider.getGenericClass(field, asClassOrInterface, genericArgumentName);
  }

  public Class getGenericClass(
      AnnotatedElement field, Class asClassOrInterface, String genericArgumentName) {
    return genericClassProvider.getGenericClass(field, asClassOrInterface, genericArgumentName);
  }

  public Class getGenericClass(
      ParameterizedType parameterizedType, Class asClassOrInterface, String genericArgumentName) {
    return genericClassProvider.getGenericClass(
        parameterizedType, asClassOrInterface, genericArgumentName);
  }

  public Class getGenericClass(
      Class sourceClass, Class asClassOrInterface, String genericArgumentName) {
    return genericClassProvider.getGenericClass(
        sourceClass, asClassOrInterface, genericArgumentName);
  }

  public Class getGenericClass(
      ParameterizedType parameterizedType,
      Class sourceClass,
      Class asClassOrInterface,
      String genericArgumentName) {
    return genericClassProvider.getGenericClass(
        parameterizedType, sourceClass, asClassOrInterface, genericArgumentName);
  }

  public List<io.mateu.core.domain.model.reflection.fieldabstraction.Field>
      getAllTransferrableFields(Class modelType) {
    return allTransferrableFieldsProvider.getAllTransferrableFields(modelType);
  }

  public List<io.mateu.core.domain.model.reflection.fieldabstraction.Field> getAllEditableFields(
      Class modelType) {
    return allEditableFieldsProvider.getAllEditableFilteredFields(modelType, null, null);
  }

  public List<io.mateu.core.domain.model.reflection.fieldabstraction.Field> getAllEditableFields(
      Class modelType, Class superType, boolean includeReverseMappers) {
    return allEditableFieldsProvider.getAllEditableFields(
        modelType, superType, includeReverseMappers, null);
  }

  public List<io.mateu.core.domain.model.reflection.fieldabstraction.Field> getAllEditableFields(
      Class modelType,
      Class superType,
      boolean includeReverseMappers,
      io.mateu.core.domain.model.reflection.fieldabstraction.Field field) {
    return allEditableFieldsProvider.getAllEditableFields(
        modelType, superType, includeReverseMappers, field);
  }

  public Class<?> getGenericClass(Class type) {
    return genericClassProvider.getGenericClass(type);
  }

  public Class<?> getGenericClass(Type type) {
    return genericClassProvider.getGenericClass(type);
  }

  public Set<Class> getSubclasses(Class c) {
    return subclassProvider.getSubclasses(c);
  }

  public Class<?> getGenericClass(Method m) {
    return genericClassProvider.getGenericClass(m);
  }

  public void copy(Object from, Object to) {
    objectCopier.copy(from, to);
  }

  public Object newInstance(Constructor c, Object params) throws Throwable {
    return instanceProvider.newInstance(c, params);
  }

  public <T> T newInstance(Class<T> c)
      throws NoSuchMethodException,
          IllegalAccessException,
          InvocationTargetException,
          InstantiationException {
    return instanceProvider.newInstance(c);
  }

  public Object newInstance(Class c, Map<String, Object> data)
      throws IllegalAccessException,
          InstantiationException,
          InvocationTargetException,
          NoSuchMethodException {
    var instance = instanceProvider.newInstance(c);
    if (instance instanceof ObjectEditor) {
      // no need to fill the entityEditor
    } else {
      data.entrySet()
          .forEach(
              entry -> {
                try {
                  Object actualValue = actualValueExtractor.getActualValue(entry, instance);
                  setValue(entry.getKey(), instance, actualValue);
                } catch (Exception ex) {
                  System.out.println("" + ex.getClass().getSimpleName() + ": " + ex.getMessage());
                }
              });
    }
    return instance;
  }

  public Object newInstance(Class c, Object parent)
      throws IllegalAccessException,
          InstantiationException,
          InvocationTargetException,
          NoSuchMethodException {
    return instanceProvider.newInstance(c, parent);
  }

  public boolean isOverridden(Object instance, String methodName) {
    Method m = getMethod(instance.getClass(), methodName);
    return m != null
        && !m.getDeclaringClass().equals(Object.class)
        && !m.getDeclaringClass().isInterface();
  }

  public Class getType(AnnotatedElement f) {
    return typeProvider.getType(f);
  }
}
