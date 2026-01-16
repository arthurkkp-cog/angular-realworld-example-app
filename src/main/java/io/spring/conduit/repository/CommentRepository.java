package io.spring.conduit.repository;

import io.spring.conduit.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {
    
    @Query("SELECT c FROM Comment c WHERE c.article.slug = :slug ORDER BY c.createdAt DESC")
    List<Comment> findByArticleSlug(@Param("slug") String slug);
    
    @Query("SELECT c FROM Comment c WHERE c.article.id = :articleId ORDER BY c.createdAt DESC")
    List<Comment> findByArticleId(@Param("articleId") String articleId);
}
