package io.spring.conduit.service;

import io.spring.conduit.domain.Article;
import io.spring.conduit.domain.Tag;
import io.spring.conduit.domain.User;
import io.spring.conduit.repository.ArticleFavoriteRepository;
import io.spring.conduit.repository.ArticleRepository;
import io.spring.conduit.repository.FollowRelationRepository;
import io.spring.conduit.repository.TagRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final TagRepository tagRepository;
    private final ArticleFavoriteRepository articleFavoriteRepository;
    private final FollowRelationRepository followRelationRepository;

    public ArticleService(ArticleRepository articleRepository, 
                         TagRepository tagRepository,
                         ArticleFavoriteRepository articleFavoriteRepository,
                         FollowRelationRepository followRelationRepository) {
        this.articleRepository = articleRepository;
        this.tagRepository = tagRepository;
        this.articleFavoriteRepository = articleFavoriteRepository;
        this.followRelationRepository = followRelationRepository;
    }

    public Page<Article> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return articleRepository.findAllOrderByCreatedAtDesc(pageable);
    }

    public Page<Article> findByTag(String tag, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return articleRepository.findByTag(tag, pageable);
    }

    public Page<Article> findByAuthor(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return articleRepository.findByAuthorUsername(username, pageable);
    }

    public Page<Article> findFavoritedBy(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return articleRepository.findFavoritedByUsername(username, pageable);
    }

    public Page<Article> findFeed(User user, int page, int size) {
        List<String> followingIds = followRelationRepository.findFollowingIdsByFollowerId(user.getId());
        if (followingIds.isEmpty()) {
            return Page.empty();
        }
        Pageable pageable = PageRequest.of(page, size);
        return articleRepository.findByAuthorIdIn(followingIds, pageable);
    }

    public Optional<Article> findBySlug(String slug) {
        return articleRepository.findBySlug(slug);
    }

    @Transactional
    public Article create(String title, String description, String body, List<String> tagNames, User author) {
        Article article = new Article(title, description, body, author);
        
        if (tagNames != null && !tagNames.isEmpty()) {
            Set<Tag> tags = tagNames.stream()
                    .map(name -> tagRepository.findByName(name)
                            .orElseGet(() -> tagRepository.save(new Tag(name))))
                    .collect(Collectors.toSet());
            article.setTags(tags);
        }
        
        return articleRepository.save(article);
    }

    @Transactional
    public Article update(Article article, String title, String description, String body, List<String> tagNames) {
        article.update(title, description, body);
        
        if (tagNames != null) {
            article.getTags().clear();
            Set<Tag> tags = tagNames.stream()
                    .map(name -> tagRepository.findByName(name)
                            .orElseGet(() -> tagRepository.save(new Tag(name))))
                    .collect(Collectors.toSet());
            article.setTags(tags);
        }
        
        return articleRepository.save(article);
    }

    @Transactional
    public void delete(String slug) {
        articleRepository.deleteBySlug(slug);
    }

    public boolean isFavorited(Article article, User user) {
        if (user == null) {
            return false;
        }
        return articleFavoriteRepository.existsByArticleIdAndUserId(article.getId(), user.getId());
    }

    public int getFavoritesCount(Article article) {
        return articleFavoriteRepository.countByArticleId(article.getId());
    }
}
