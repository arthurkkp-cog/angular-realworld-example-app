package io.spring.conduit.controller;

import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.ast.Node;
import io.spring.conduit.domain.Article;
import io.spring.conduit.domain.Comment;
import io.spring.conduit.domain.User;
import io.spring.conduit.service.ArticleService;
import io.spring.conduit.service.CommentService;
import io.spring.conduit.service.FavoriteService;
import io.spring.conduit.service.ProfileService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/article")
public class ArticleController {

    private final ArticleService articleService;
    private final CommentService commentService;
    private final FavoriteService favoriteService;
    private final ProfileService profileService;
    private final Parser markdownParser;
    private final HtmlRenderer htmlRenderer;

    public ArticleController(ArticleService articleService, CommentService commentService,
                            FavoriteService favoriteService, ProfileService profileService) {
        this.articleService = articleService;
        this.commentService = commentService;
        this.favoriteService = favoriteService;
        this.profileService = profileService;
        this.markdownParser = Parser.builder().build();
        this.htmlRenderer = HtmlRenderer.builder().build();
    }

    @GetMapping("/{slug}")
    public String viewArticle(@PathVariable String slug,
                             @AuthenticationPrincipal User currentUser,
                             Model model) {
        Optional<Article> articleOptional = articleService.findBySlug(slug);
        
        if (articleOptional.isEmpty()) {
            return "redirect:/";
        }
        
        Article article = articleOptional.get();
        List<Comment> comments = commentService.findByArticleSlug(slug);
        
        // Convert markdown to HTML
        Node document = markdownParser.parse(article.getBody());
        String bodyHtml = htmlRenderer.render(document);
        
        model.addAttribute("article", article);
        model.addAttribute("bodyHtml", bodyHtml);
        model.addAttribute("comments", comments);
        model.addAttribute("currentUser", currentUser);
        model.addAttribute("canModify", currentUser != null && 
                currentUser.getUsername().equals(article.getAuthor().getUsername()));
        model.addAttribute("favorited", favoriteService.isFavorited(article, currentUser));
        model.addAttribute("favoritesCount", favoriteService.getFavoritesCount(article));
        model.addAttribute("following", currentUser != null && 
                profileService.isFollowing(currentUser, article.getAuthor()));
        
        return "article/view";
    }

    @PostMapping("/{slug}/comments")
    public String addComment(@PathVariable String slug,
                            @RequestParam String body,
                            @AuthenticationPrincipal User currentUser,
                            RedirectAttributes redirectAttributes) {
        if (currentUser == null) {
            return "redirect:/login";
        }
        
        Optional<Article> articleOptional = articleService.findBySlug(slug);
        if (articleOptional.isEmpty()) {
            return "redirect:/";
        }
        
        commentService.create(body, articleOptional.get(), currentUser);
        return "redirect:/article/" + slug;
    }

    @PostMapping("/{slug}/comments/{commentId}/delete")
    public String deleteComment(@PathVariable String slug,
                               @PathVariable String commentId,
                               @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return "redirect:/login";
        }
        
        Optional<Comment> commentOptional = commentService.findById(commentId);
        if (commentOptional.isPresent() && commentService.canDelete(commentOptional.get(), currentUser)) {
            commentService.delete(commentId);
        }
        
        return "redirect:/article/" + slug;
    }

    @PostMapping("/{slug}/favorite")
    public String favorite(@PathVariable String slug,
                          @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return "redirect:/login";
        }
        
        Optional<Article> articleOptional = articleService.findBySlug(slug);
        if (articleOptional.isPresent()) {
            favoriteService.favorite(articleOptional.get(), currentUser);
        }
        
        return "redirect:/article/" + slug;
    }

    @PostMapping("/{slug}/unfavorite")
    public String unfavorite(@PathVariable String slug,
                            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return "redirect:/login";
        }
        
        Optional<Article> articleOptional = articleService.findBySlug(slug);
        if (articleOptional.isPresent()) {
            favoriteService.unfavorite(articleOptional.get(), currentUser);
        }
        
        return "redirect:/article/" + slug;
    }

    @PostMapping("/{slug}/delete")
    public String deleteArticle(@PathVariable String slug,
                               @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return "redirect:/login";
        }
        
        Optional<Article> articleOptional = articleService.findBySlug(slug);
        if (articleOptional.isPresent() && 
                currentUser.getUsername().equals(articleOptional.get().getAuthor().getUsername())) {
            articleService.delete(slug);
        }
        
        return "redirect:/";
    }
}
