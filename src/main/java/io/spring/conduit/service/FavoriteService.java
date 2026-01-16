package io.spring.conduit.service;

import io.spring.conduit.domain.Article;
import io.spring.conduit.domain.ArticleFavorite;
import io.spring.conduit.domain.User;
import io.spring.conduit.repository.ArticleFavoriteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FavoriteService {

    private final ArticleFavoriteRepository articleFavoriteRepository;

    public FavoriteService(ArticleFavoriteRepository articleFavoriteRepository) {
        this.articleFavoriteRepository = articleFavoriteRepository;
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

    @Transactional
    public void favorite(Article article, User user) {
        if (!isFavorited(article, user)) {
            ArticleFavorite favorite = new ArticleFavorite(article.getId(), user.getId());
            articleFavoriteRepository.save(favorite);
        }
    }

    @Transactional
    public void unfavorite(Article article, User user) {
        articleFavoriteRepository.deleteByArticleIdAndUserId(article.getId(), user.getId());
    }
}
