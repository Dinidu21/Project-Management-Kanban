package com.dinidu.pms.repo;

import com.dinidu.pms.entity.Project;
import com.dinidu.pms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwner(User owner);
    List<Project> findByOwnerOrderByCreatedAtDesc(User owner);
}
