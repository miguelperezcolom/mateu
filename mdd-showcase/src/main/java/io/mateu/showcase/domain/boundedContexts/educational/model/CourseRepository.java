package io.mateu.showcase.domain.boundedContexts.educational.model;

import io.mateu.mdd.core.annotations.Repository;
import io.mateu.mdd.core.interfaces.IRepository;

@Repository
public interface CourseRepository extends IRepository<AcademicCourse, Long> {
}
