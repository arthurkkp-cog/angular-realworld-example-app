package io.spring.conduit.repository;

import io.spring.conduit.domain.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, String> {
    
    Optional<Article> findBySlug(String slug);
    
    void deleteBySlug(String slug);
    
    @Query("SELECT a FROM Article a WHERE a.author.username = :username ORDER BY a.createdAt DESC")
    Page<Article> findByAuthorUsername(@Param("username") String username, Pageable pageable);
    
    @Query("SELECT a FROM Article a JOIN a.tags t WHERE t.name = :tag ORDER BY a.createdAt DESC")
    Page<Article> findByTag(@Param("tag") String tag, Pageable pageable);
    
    @Query("SELECT a FROM Article a ORDER BY a.createdAt DESC")
    Page<Article> findAllOrderByCreatedAtDesc(Pageable pageable);
    
    @Query("SELECT a FROM Article a WHERE a.author.id IN :authorIds ORDER BY a.createdAt DESC")
    Page<Article> findByAuthorIdIn(@Param("authorIds") List<String> authorIds, Pageable pageable);
    
    @Query("SELECT a FROM Article a JOIN ArticleFavorite af ON a.id = af.articleId WHERE af.userId = :userId ORDER BY a.createdAt DESC")
    Page<Article> findFavoritedByUserId(@Param("userId") String userId, Pageable pageable);
    
    @Query("SELECT a FROM Article a JOIN ArticleFavorite af ON a.id = af.articleId JOIN User u ON af.userId = u.id WHERE u.username = :username ORDER BY a.createdAt DESC")
    Page<Article> findFavoritedByUsername(@Param("username") String username, Pageable pageable);
}
