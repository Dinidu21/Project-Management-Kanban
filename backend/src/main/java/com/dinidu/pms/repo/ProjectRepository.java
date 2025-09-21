package com.dinidu.pms.repo;

import com.dinidu.pms.entity.Project;
import com.dinidu.pms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwner(User owner);
    List<Project> findByOwnerOrderByCreatedAtDesc(User owner);

    @Query("""
           select distinct p
           from Project p
           left join p.team t
           where (:admin = true)
              or p.owner = :user
              or (t is not null and (t.owner = :user or :user member of t.members))
           order by p.createdAt desc
           """)
    List<Project> findAccessibleProjectsFor(User user, boolean admin);
}
