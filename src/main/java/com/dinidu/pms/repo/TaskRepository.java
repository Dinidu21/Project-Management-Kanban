package com.dinidu.pms.repo;

import com.dinidu.pms.entity.Project;
import com.dinidu.pms.entity.Task;
import com.dinidu.pms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignee(User assignee);
    List<Task> findByProject(Project project);
    List<Task> findByAssigneeOrderByCreatedAtDesc(User assignee);

    @Query("SELECT t FROM Task t WHERE t.assignee = :user OR t.project.owner = :user")
    List<Task> findTasksByUserOrProjectOwner(@Param("user") User user);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee = :user AND t.status = :status")
    Long countTasksByUserAndStatus(@Param("user") User user, @Param("status") Task.Status status);
}