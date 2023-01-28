package io.mateu.mdd.annotationProcessing;

import com.google.auto.service.AutoService;
import io.mateu.mdd.core.annotations.MateuUIServlet;

import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Set;

@SupportedAnnotationTypes({"io.mateu.mdd.core.annotations.MateuUIServlet"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
@AutoService(Processor.class)
public class MateuUIServletAnnotationProcessor extends AbstractProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        for (TypeElement annotation : annotations) {
            Set<? extends Element> annotatedElements = roundEnv.getElementsAnnotatedWith(annotation);

            for (Element e : annotatedElements) {
                String className = ((TypeElement) e).getQualifiedName().toString();
                String simpleClassName = ((TypeElement) e).getSimpleName().toString();

                System.out.println("MateuUIServletAnnotationProcessor running on " + simpleClassName);

                String generatedFullClassName = className;
                String pkgName = generatedFullClassName
                        .substring(0, generatedFullClassName.lastIndexOf("."));
                String generatedClassName = generatedFullClassName
                        .substring(generatedFullClassName.lastIndexOf(".") + 1);

                JavaFileObject builderFile = null;
                try {
                    createServletRegistrationBean(pkgName, simpleClassName, className, e);

                    createVaadinService(pkgName, simpleClassName);

                    createJPAHelperImplementation(pkgName);

                } catch (IOException ex) {
                    if (ex.getMessage() != null &&
                            ex.getMessage().startsWith("Attempt to recreate a file for type"))
                        System.out.println(ex.getMessage());
                    else ex.printStackTrace();
                }

            }
        }

        return true;
    }

    private void createJPAHelperImplementation(CharSequence pkgName) throws IOException {
        JavaFileObject builderFile = processingEnv.getFiler()
                .createSourceFile(pkgName + ".JPAHelperImpl");
        try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
            // writing generated file to out …

            out.println("package " + pkgName + ";");

            out.println("\n" +
                    "\n" +
                    "import com.google.auto.service.AutoService;\n" +
                    "import io.mateu.mdd.shared.JPAAdapter;\n" +
                    "import io.mateu.mdd.shared.ui.MDDUIAccessor;\n" +
                    "import io.mateu.util.Helper;\n" +
                    "import io.mateu.util.IJPAHelper;\n" +
                    "import io.mateu.util.persistence.JPAHelper;\n" +
                    "import io.mateu.util.persistence.JPATransaction;\n" +
                    "import io.mateu.util.runnable.RunnableThrowsThrowable;\n" +
                    "import org.springframework.beans.factory.annotation.Autowired;\n" +
                    "import org.springframework.stereotype.Component;\n" +
                    "import org.springframework.transaction.annotation.Transactional;\n" +
                    "import lombok.extern.slf4j.Slf4j;\n" +
                    "\n" +
                    "import javax.annotation.PostConstruct;\n" +
                    "import javax.persistence.*;\n" +
                    "import javax.persistence.criteria.CriteriaBuilder;\n" +
                    "import javax.persistence.criteria.CriteriaQuery;\n" +
                    "import javax.persistence.criteria.Predicate;\n" +
                    "import javax.persistence.criteria.Root;\n" +
                    "import javax.validation.ConstraintViolation;\n" +
                    "import javax.validation.ConstraintViolationException;\n" +
                    "import java.util.*;\n" +
                    "\n" +
                    "@Component\n" +
                    "@Slf4j\n" +
                    "public class JPAHelperImpl implements IJPAHelper {\n" +
                    "\n" +
                    "\n" +
                    "    @Autowired\n" +
                    "    private EntityManagerFactory emf;\n" +
                    "\n" +
                    "    @PostConstruct\n" +
                    "    public void post() {\n" +
                    "        JPAHelper.set(this);\n" +
                    "    }\n" +
                    "\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public void transact(JPATransaction t) throws Throwable {\n" +
                    "        transact(MDDUIAccessor.getPersistenceUnitName(), t, null);\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public void transact(JPATransaction t, RunnableThrowsThrowable callback) throws " +
                    "Throwable {\n" +
                    "        transact(MDDUIAccessor.getPersistenceUnitName(), t, callback);\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public void transact(String persistenceUnit, JPATransaction t) throws Throwable {\n" +
                    "        transact(persistenceUnit, t, null);\n" +
                    "    }\n" +
                    "\n" +
                    "    @Transactional\n" +
                    "    @Override\n" +
                    "    public void transact(String persistenceUnit, JPATransaction t, RunnableThrowsThrowable " +
                    "callback) throws Throwable {\n" +
                    "        try {\n" +
                    "\n" +
                    "            EntityManager em = emf.createEntityManager();\n" +
                    "\n" +
                    "            try {\n" +
                    "\n" +
                    "                em.getTransaction().begin();\n" +
                    "\n" +
                    "                t.run(em);\n" +
                    "\n" +
                    "                em.getTransaction().commit();\n" +
                    "\n" +
                    "            } catch (Throwable e) {\n" +
                    "\n" +
                    "                e.printStackTrace();\n" +
                    "                if (em.getTransaction().isActive()) em.getTransaction().rollback();\n" +
                    "                em.close();\n" +
                    "                e = e.getCause() != null && e.getCause() instanceof " +
                    "ConstraintViolationException ?e.getCause():e;\n" +
                    "                if (e instanceof ConstraintViolationException) {\n" +
                    "                    StringBuffer sb = new StringBuffer();\n" +
                    "                    ((ConstraintViolationException)e).getConstraintViolations()" +
                    ".forEach(v -> sb.append((\"\".equals(sb.toString())?\"\":\"\\n\") + " +
                    "(v.getPropertyPath() != null?v.getPropertyPath().toString() + \" \":\"\") + v.getMessage() " +
                    "+ (v.getRootBeanClass() != null?\" en \" + " +
                    "v.getRootBeanClass().getSimpleName() + \"\":\"\")));\n" +
                    "                    e = new Exception(sb.toString());\n" +
                    "                }\n" +
                    "                rethrow(e);\n" +
                    "\n" +
                    "            }\n" +
                    "\n" +
                    "            em.close();\n" +
                    "\n" +
                    "        } catch (Throwable e) {\n" +
                    "            rethrow(e.getCause() != null && e.getCause() instanceof " +
                    "ConstraintViolationException?e.getCause():e);\n" +
                    "        }\n" +
                    "    }\n" +
                    "\n" +
                    "    public void rethrow(Throwable e) throws Throwable {\n" +
                    "        if (e instanceof ConstraintViolationException) {\n" +
                    "            StringBuffer sb = new StringBuffer();\n" +
                    "            for (ConstraintViolation v : ((ConstraintViolationException)e)" +
                    ".getConstraintViolations()) {\n" +
                    "                if (sb.length() > 0) sb.append(\"\\n\");\n" +
                    "                sb.append(\"\" + v.getPropertyPath() + \" \" + v.getMessage() " +
                    "+ \" at \" + Helper.capitalize(v.getRootBeanClass().getSimpleName()));\n" +
                    "            }\n" +
                    "            throw new Exception(sb.toString());\n" +
                    "        } else throw e;\n" +
                    "    }\n" +
                    "\n" +
                    "    public void printStackTrace(Throwable e) {\n" +
                    "        log.error(\"\", e);\n" +
                    "        if (e instanceof ConstraintViolationException) {\n" +
                    "            StringBuffer sb = new StringBuffer();\n" +
                    "            for (ConstraintViolation v : ((ConstraintViolationException)e)" +
                    ".getConstraintViolations()) {\n" +
                    "                if (sb.length() > 0) sb.append(\"\\n\");\n" +
                    "                sb.append(\"\" + v.getPropertyPath() + \" \" + v.getMessage() " +
                    "+ \" at \" + Helper.capitalize(v.getRootBeanClass().getSimpleName()));\n" +
                    "            }\n" +
                    "            log.warn(sb.toString());\n" +
                    "        } else {" +
                    "           log.error(\"JPA related error\", e);" +
                    "        }\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public void closeEMFs() {\n" +
                    "\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public void setEMF(EntityManagerFactory f) {\n" +
                    "\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public EntityManagerFactory getEMF() {\n" +
                    "        return emf;\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public EntityManagerFactory getEMF(String persistenceUnit) {\n" +
                    "        return emf;\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public void notransact(JPATransaction t) throws Throwable {\n" +
                    "        notransact(MDDUIAccessor.getPersistenceUnitName(), t, true);\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public void notransact(JPATransaction t, boolean printException) throws Throwable {\n" +
                    "        notransact(MDDUIAccessor.getPersistenceUnitName(), t, printException);\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public void notransact(String persistenceUnit, JPATransaction t) throws Throwable {\n" +
                    "        notransact(persistenceUnit, t, true);\n" +
                    "    }\n" +
                    "\n" +
                    "    @Transactional(readOnly = true)\n" +
                    "    @Override\n" +
                    "    public void notransact(String persistenceUnit, JPATransaction t, " +
                    "boolean printException) throws Throwable {\n" +
                    "\n" +
                    "        EntityManager em = emf.createEntityManager();\n" +
                    "\n" +
                    "        try {\n" +
                    "\n" +
                    "            t.run(em);\n" +
                    "\n" +
                    "        } catch (Exception e) {\n" +
                    "            if (printException) e.printStackTrace();\n" +
                    "            em.close();\n" +
                    "            throw e;\n" +
                    "        }\n" +
                    "\n" +
                    "        em.close();\n" +
                    "\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public <T> T find(Class<T> type, Object id) throws Throwable {\n" +
                    "        Object[] o = {null};\n" +
                    "        notransact(em -> {\n" +
                    "            o[0] = em.find(type, id);\n" +
                    "        });\n" +
                    "        return (T) o[0];\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public <T> List<T> findAll(EntityManager em, Class<T> type) throws Throwable {\n" +
                    "        return em.createQuery(\"select x from \" + type.getName() + \" x\")" +
                    ".setFlushMode(FlushModeType.COMMIT).getResultList();\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public <T> List<T> findAll(Class<T> type) throws Throwable {\n" +
                    "        List<T> l = new ArrayList<>();\n" +
                    "        notransact(em -> {\n" +
                    "            l.addAll(findAll(em, type));\n" +
                    "        });\n" +
                    "        return l;\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public <T> List<T> getAll(Class<T> type) {\n" +
                    "        try {\n" +
                    "            return findAll(type);\n" +
                    "        } catch (Throwable throwable) {\n" +
                    "            throwable.printStackTrace();\n" +
                    "        }\n" +
                    "        return new ArrayList<>();\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public <T> T get(Class<T> type, Object id) {\n" +
                    "        try {\n" +
                    "            return find(type, id);\n" +
                    "        } catch (Throwable throwable) {\n" +
                    "            throwable.printStackTrace();\n" +
                    "        }\n" +
                    "        return null;\n" +
                    "    }\n" +
                    "\n" +
                    "\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public <T> Optional<T> selectValue(String jpql) throws Throwable {\n" +
                    "        return selectValue(jpql, null);\n" +
                    "    }\n" +
                    "\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public <T> Optional<T> selectValue(String jpql, Map<String, Object> params) " +
                    "throws Throwable {\n" +
                    "        List<T> l = selectObjects(jpql, params);\n" +
                    "        return Optional.of(l.size() > 0?l.get(0):null);\n" +
                    "    }\n" +
                    "\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public List selectObjects(String jpql) throws Throwable {\n" +
                    "        return selectObjects(jpql, new HashMap<>());\n" +
                    "    }\n" +
                    "\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public List selectObjects(String jpql, Map<String, Object> params) " +
                    "throws Throwable {\n" +
                    "        List l = new ArrayList<>();\n" +
                    "\n" +
                    "        notransact(em -> {\n" +
                    "\n" +
                    "            Query q = em.createQuery(jpql);\n" +
                    "            Helper.getImpl(JPAAdapter.class).hint(q);\n" +
                    "\n" +
                    "            if (params != null) {\n" +
                    "                for (String k : params.keySet()) q.setParameter(k, params.get(k));\n" +
                    "            }\n" +
                    "\n" +
                    "            l.addAll(q.getResultList());\n" +
                    "\n" +
                    "\n" +
                    "        });\n" +
                    "\n" +
                    "        return l;\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public List selectObjects(String jpql, Class targetClass) throws Throwable {\n" +
                    "        return selectObjects(jpql, new HashMap<>(), targetClass);\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public List selectObjects(String jpql, Map<String, Object> params, Class targetClass) " +
                    "throws Throwable {\n" +
                    "        List l = new ArrayList<>();\n" +
                    "\n" +
                    "        notransact(em -> {\n" +
                    "\n" +
                    "            Query q = em.createQuery(jpql, targetClass);\n" +
                    "            Helper.getImpl(JPAAdapter.class).hint(q);\n" +
                    "\n" +
                    "            if (params != null) {\n" +
                    "                for (String k : params.keySet()) q.setParameter(k, params.get(k));\n" +
                    "            }\n" +
                    "\n" +
                    "\n" +
                    "            l.addAll(q.getResultList());\n" +
                    "\n" +
                    "        });\n" +
                    "\n" +
                    "        return l;\n" +
                    "    }\n" +
                    "\n" +
                    "    //todo: sql nativo\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public List<Object[]> nativeSelect(String sql) throws Throwable {\n" +
                    "        List<Object[]> list = new ArrayList<>();\n" +
                    "\n" +
                    "        notransact(em -> {\n" +
                    "\n" +
                    "            Query q = em.createNativeQuery(sql);\n" +
                    "            list.addAll(q.getResultList());\n" +
                    "\n" +
                    "        });\n" +
                    "\n" +
                    "        return list;\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public Object nativeSelectValue(String sql) throws Throwable {\n" +
                    "        List<Object[]> list = new ArrayList<>();\n" +
                    "\n" +
                    "        notransact(em -> {\n" +
                    "\n" +
                    "            Query q = em.createNativeQuery(sql);\n" +
                    "            list.addAll(q.getResultList());\n" +
                    "\n" +
                    "        });\n" +
                    "\n" +
                    "        return list.size() > 0?(list.get(0) instanceof Object[]?list.get(0)[0]:" +
                    "list.get(0)):null;\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public List<Object[]> sqlSelectPage(String jpql, int offset, int limit) throws " +
                    "Throwable {\n" +
                    "        List<Object[]> list = new ArrayList<>();\n" +
                    "\n" +
                    "        notransact(em -> {\n" +
                    "\n" +
                    "            Query q = em.createQuery(jpql);\n" +
                    "\n" +
                    "            q.setFirstResult(offset);\n" +
                    "            q.setMaxResults(limit);\n" +
                    "            Helper.getImpl(JPAAdapter.class).hint(q);\n" +
                    "\n" +
                    "\n" +
                    "            list.addAll(q.getResultList());\n" +
                    "\n" +
                    "        });\n" +
                    "\n" +
                    "        return list;\n" +
                    "    }\n" +
                    "\n" +
                    "    //todo: sql nativo\n" +
                    "    @Override\n" +
                    "    public int sqlCount(String sql) throws Throwable {\n" +
                    "        int[] count = {0};\n" +
                    "\n" +
                    "        notransact(em -> {\n" +
                    "\n" +
                    "            String countjpql = \"select count(*) from (\" + sql + \") xxx\";\n" +
                    "            Query q = em.createQuery(countjpql);\n" +
                    "            Helper.getImpl(JPAAdapter.class).hint(q);\n" +
                    "            count[0] = ((Long)q.getSingleResult()).intValue();\n" +
                    "\n" +
                    "\n" +
                    "        });\n" +
                    "\n" +
                    "        return count[0];\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public String runNativeSqlUpdate(String sql) throws Throwable {\n" +
                    "        StringBuffer sb = new StringBuffer();\n" +
                    "        transact(em -> {\n" +
                    "            log.info(\"running \" + sql);\n" +
                    "            int r = em.createNativeQuery(sql).executeUpdate();\n" +
                    "            sb.append(r);\n" +
                    "        });\n" +
                    "        return sb.toString();\n" +
                    "    }\n" +
                    "\n" +
                    "\n" +
                    "\n" +
                    "\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public <T> void deleteWithId(EntityManager em, Class<T> type, Object id) {\n" +
                    "        T o = em.find(type, id);\n" +
                    "        if (o != null) em.remove(o);\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public <T> T find(EntityManager em, Class<T> type, Object... params) {\n" +
                    "        TypedQuery<T> q = createQuery(em, type, params);\n" +
                    "        return q.getSingleResult();\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public <T> T find(Class<T> type, Object... params) {\n" +
                    "        Object[] o = {null};\n" +
                    "        try {\n" +
                    "            notransact(em -> {\n" +
                    "                TypedQuery<T> q = createQuery(em, type, params);\n" +
                    "                o[0] = q.getSingleResult();\n" +
                    "            });\n" +
                    "        } catch (Throwable throwable) {\n" +
                    "            throwable.printStackTrace();\n" +
                    "        }\n" +
                    "        return (T) o[0];\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public <T> TypedQuery<T> createQuery(EntityManager em, Class<T> type, Object[] params) " +
                    "{\n" +
                    "        CriteriaBuilder b = em.getCriteriaBuilder();\n" +
                    "        CriteriaQuery<T> cq = b.createQuery(type);\n" +
                    "        Root<T> root = cq.from(type);\n" +
                    "        int pos = 0;\n" +
                    "        Object o0 = null;\n" +
                    "        List<Predicate> predicados = new ArrayList<>();\n" +
                    "        for (Object o : params) {\n" +
                    "            if (pos > 0 && pos % 2 == 1) {\n" +
                    "                predicados.add(b.equal(root.get(\"\" + o0), o));\n" +
                    "            } else {\n" +
                    "                o0 = o;\n" +
                    "            }\n" +
                    "            pos++;\n" +
                    "        }\n" +
                    "        Predicate todosLosPredicados = b.and(predicados.toArray(new Predicate[0]));\n" +
                    "        TypedQuery<T> q = em.createQuery(cq.select(root).where(todosLosPredicados));\n" +
                    "        return q;\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public <T> List<T> list(EntityManager em, Class<T> type, Object... params) {\n" +
                    "        TypedQuery<T> q = createQuery(em, type, params);\n" +
                    "        return q.getResultList();\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public <T> void delete(EntityManager em, Class<T> type, Object... params) {\n" +
                    "        T o = find(em, type, params);\n" +
                    "        if (o != null) em.remove(o);\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public <T> int count(EntityManager em, Class<T> type) {\n" +
                    "        try {\n" +
                    "            return findAll(type).size();\n" +
                    "        } catch (Throwable throwable) {\n" +
                    "            throwable.printStackTrace();\n" +
                    "        }\n" +
                    "        return 0;\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public <T> int count(EntityManager em, Class<T> type, Object... params) {\n" +
                    "        return list(em, type, params).size();\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public <T> TypedQuery<T> createQueryForCount(EntityManager em, Class<T> type, " +
                    "Object[] params) {\n" +
                    "        CriteriaBuilder b = em.getCriteriaBuilder();\n" +
                    "        CriteriaQuery<T> cq = b.createQuery(type);\n" +
                    "        Root<T> root = cq.from(type);\n" +
                    "        int pos = 0;\n" +
                    "        Object o0 = null;\n" +
                    "        List<Predicate> predicados = new ArrayList<>();\n" +
                    "        for (Object o : params) {\n" +
                    "            if (pos > 0 && pos % 2 == 1) {\n" +
                    "                predicados.add(b.equal(root.get(\"\" + o0), o));\n" +
                    "            } else {\n" +
                    "                o0 = o;\n" +
                    "            }\n" +
                    "            pos++;\n" +
                    "        }\n" +
                    "        Predicate todosLosPredicados = b.and(predicados.toArray(new Predicate[0]));\n" +
                    "        TypedQuery<T> q = em.createQuery(cq.select(root).where(todosLosPredicados));\n" +
                    "        return q;\n" +
                    "    }\n" +
                    "\n" +
                    "    @Override\n" +
                    "    public void update(Object a, String fieldName, Object value) {\n" +
                    "        // debe actualizar la propiedad \"fieldName\" en el objeto a, con el valor value\n" +
                    "        // resolviendo cualquier mapeado inverso, tanto en el valor anterior como en " +
                    "el nuevo valor\n" +
                    "        //todo: implementar\n" +
                    "    }\n" +
                    "}\n");
        }
    }

    private void createVaadinService(CharSequence pkgName, String simpleClassName) throws IOException {
        JavaFileObject builderFile = processingEnv.getFiler().createSourceFile(pkgName + "." +
                simpleClassName + "VaadinService");
        try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
            // writing generated file to out …

            out.println("package " + pkgName + ";");

            out.println("import io.mateu.mdd.vaadin.VaadinResourcesServlet;");
            out.println("import org.springframework.boot.web.servlet.ServletRegistrationBean;");
            out.println("import org.springframework.stereotype.Service;");
            out.println("import org.springframework.beans.factory.annotation.Autowired;");
            out.println("import org.springframework.context.ApplicationContext;");
            out.println("import javax.annotation.PostConstruct;");
            out.println("import io.mateu.reflection.ReflectionHelper;");

            out.println("");
            out.println("");
            out.println("");


            out.println();
            out.println("@Service");
            out.println("public class " + simpleClassName + "VaadinService extends ServletRegistrationBean " +
                    "implements io.mateu.mdd.springboot.BeanProvider {");
            out.println("");
            out.println("    @Autowired\n" +
                    "    private ApplicationContext сontext;");
            out.println("");
            out.println("");
            out.println("    @PostConstruct\n" +
                    "    public void postConstruct() {\n" +
                    "        ReflectionHelper.setBeanProvider(this);\n" +
                    "    }\n" +
                    "\n" +
                    "    public Object getBean(Class c) {\n" +
                    "        Object o = null;\n" +
                    "        try {\n" +
                    "            o = сontext.getBean(c);\n" +
                    "        } catch (Exception e) {\n" +
                    "\n" +
                    "        }\n" +
                    "        return o;\n" +
                    "    }");
            out.println("");
            out.println("    public " + simpleClassName + "VaadinService() {");
            out.println("        super(new VaadinResourcesServlet(), \"/VAADIN\", \"/VAADIN/*\");");
            out.println("    }");
            out.println("}");
        }

    }

    private void createServletRegistrationBean(CharSequence pkgName, String simpleClassName, String className
            , Element e) throws IOException {
        JavaFileObject builderFile = processingEnv.getFiler().createSourceFile(pkgName + "." +
                simpleClassName + "Bean");
        try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
            // writing generated file to out …

            out.println("package " + pkgName + ";");
            out.println("import " + className + ";");

            out.println("import org.springframework.boot.web.servlet.ServletRegistrationBean;");
            out.println("import org.springframework.stereotype.Service;");

            out.println("");


            out.println();
            out.println("@Service");
            out.println("public class " + simpleClassName + "Bean extends ServletRegistrationBean {");
            out.println("");
            out.println("    public " + simpleClassName + "Bean() {");
            out.println("        super(new " + simpleClassName + "(), \"" +
                    e.getAnnotation(MateuUIServlet.class).path() + "\", \"" +
                    ("/".equals(e.getAnnotation(MateuUIServlet.class).path())?"":
                            e.getAnnotation(MateuUIServlet.class).path()) + "/*\");");
            out.println("        setLoadOnStartup(500);");
            out.println("    }");
            out.println("");
            out.println("}");
        }
    }
}
