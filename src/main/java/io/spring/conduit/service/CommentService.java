package io.spring.conduit.service;

import io.spring.conduit.domain.Article;
import io.spring.conduit.domain.Comment;
import io.spring.conduit.domain.User;
import io.spring.conduit.repository.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public List<Comment> findByArticleSlug(String slug) {
        return commentRepository.findByArticleSlug(slug);
    }

    public Optional<Comment> findById(String id) {
        return commentRepository.findById(id);
    }

    @Transactional
    public Comment create(String body, Article article, User author) {
        Comment comment = new Comment(body, article, author);
        return commentRepository.save(comment);
    }

    @Transactional
    public void delete(String id) {
        commentRepository.deleteById(id);
    }

    public boolean canDelete(Comment comment, User user) {
        return comment.getAuthor().getId().equals(user.getId());
    }
}
