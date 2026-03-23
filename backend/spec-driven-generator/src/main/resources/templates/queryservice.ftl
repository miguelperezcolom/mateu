package ${project.packageName}.application.query;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;

import java.util.Optional;

public interface QueryService<DtoType, RowType, IdType> {

ListingData<RowType> findAll(String searchText,
    Object filters, Pageable pageable);

    String getLabel(String id);

    Optional<DtoType> getById(String id);

        }
