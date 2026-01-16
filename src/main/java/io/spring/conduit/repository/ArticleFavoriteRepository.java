package io.spring.conduit.repository;

import io.spring.conduit.domain.ArticleFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArticleFavoriteRepository extends JpaRepository<ArticleFavorite, ArticleFavorite.ArticleFavoriteId> {
    
    @Query("SELECT af FROM ArticleFavorite af WHERE af.articleId = :articleId AND af.userId = :userId")
    Optional<ArticleFavorite> findByArticleIdAndUserId(@Param("articleId") String articleId, @Param("userId") String userId);
    
    @Query("SELECT COUNT(af) FROM ArticleFavorite af WHERE af.articleId = :articleId")
    int countByArticleId(@Param("articleId") String articleId);
    
    @Query("SELECT COUNT(af) > 0 FROM ArticleFavorite af WHERE af.articleId = :articleId AND af.userId = :userId")
    boolean existsByArticleIdAndUserId(@Param("articleId") String articleId, @Param("userId") String userId);
    
    void deleteByArticleIdAndUserId(String articleId, String userId);
}
