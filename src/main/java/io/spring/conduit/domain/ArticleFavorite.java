package io.spring.conduit.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "article_favorites")
@IdClass(ArticleFavorite.ArticleFavoriteId.class)
public class ArticleFavorite {

    @Id
    @Column(name = "article_id")
    private String articleId;

    @Id
    @Column(name = "user_id")
    private String userId;

    public ArticleFavorite() {
    }

    public ArticleFavorite(String articleId, String userId) {
        this.articleId = articleId;
        this.userId = userId;
    }

    public String getArticleId() {
        return articleId;
    }

    public void setArticleId(String articleId) {
        this.articleId = articleId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public static class ArticleFavoriteId implements Serializable {
        private String articleId;
        private String userId;

        public ArticleFavoriteId() {
        }

        public ArticleFavoriteId(String articleId, String userId) {
            this.articleId = articleId;
            this.userId = userId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ArticleFavoriteId that = (ArticleFavoriteId) o;
            return Objects.equals(articleId, that.articleId) && Objects.equals(userId, that.userId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(articleId, userId);
        }
    }
}
