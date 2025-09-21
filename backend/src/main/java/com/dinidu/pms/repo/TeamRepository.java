package com.dinidu.pms.repo;

import com.dinidu.pms.entity.Team;
import com.dinidu.pms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {

    // Teams where user is owner or a member
    @Query("select distinct t from Team t left join t.members m where t.owner = :user or m = :user")
    List<Team> findTeamsForUser(User user);

    boolean existsByName(String name);

    @Query("SELECT COUNT(t) > 0 FROM Team t WHERE TRIM(LOWER(t.name)) = TRIM(LOWER(:name))")
    boolean existsByNameTrimmedIgnoreCase(String name);
}