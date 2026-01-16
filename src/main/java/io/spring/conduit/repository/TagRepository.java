package io.spring.conduit.repository;

import io.spring.conduit.domain.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, String> {
    
    Optional<Tag> findByName(String name);
    
    @Query("SELECT t FROM Tag t ORDER BY SIZE(t.articles) DESC")
    List<Tag> findAllOrderByPopularity();
}
