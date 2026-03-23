package ${project.packageName}.infra.out.persistence;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor@NoArgsConstructor
@Getter
public class ${aggregate.name}Entity {

@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "${aggregate.name?lower_case}_seq_gen")
@SequenceGenerator(
name = "${aggregate.name?lower_case}_seq_gen",
sequenceName = "${aggregate.name?lower_case}_sequence",
allocationSize = 1
)
Long id;

String name;

}
