package io.spring.conduit.controller;

import io.spring.conduit.domain.Article;
import io.spring.conduit.domain.User;
import io.spring.conduit.service.ArticleService;
import io.spring.conduit.service.FavoriteService;
import io.spring.conduit.service.ProfileService;
import io.spring.conduit.service.TagService;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
public class HomeController {

    private final ArticleService articleService;
    private final TagService tagService;
    private final FavoriteService favoriteService;
    private final ProfileService profileService;

    public HomeController(ArticleService articleService, TagService tagService, 
                         FavoriteService favoriteService, ProfileService profileService) {
        this.articleService = articleService;
        this.tagService = tagService;
        this.favoriteService = favoriteService;
        this.profileService = profileService;
    }

    @GetMapping("/")
    public String home(@AuthenticationPrincipal User currentUser,
                       @RequestParam(defaultValue = "all") String feed,
                       @RequestParam(required = false) String tag,
                       @RequestParam(required = false) String author,
                       @RequestParam(required = false) String favorited,
                       @RequestParam(defaultValue = "0") int page,
                       @RequestParam(defaultValue = "10") int size,
                       Model model) {
        
        Page<Article> articles;
        
        if (tag != null && !tag.isEmpty()) {
            articles = articleService.findByTag(tag, page, size);
            model.addAttribute("selectedTag", tag);
        } else if (author != null && !author.isEmpty()) {
            articles = articleService.findByAuthor(author, page, size);
        } else if (favorited != null && !favorited.isEmpty()) {
            articles = articleService.findFavoritedBy(favorited, page, size);
        } else if ("feed".equals(feed) && currentUser != null) {
            articles = articleService.findFeed(currentUser, page, size);
        } else {
            articles = articleService.findAll(page, size);
        }
        
        List<String> tags = tagService.getAllTags();
        
        model.addAttribute("articles", articles.getContent());
        model.addAttribute("articlesCount", articles.getTotalElements());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", articles.getTotalPages());
        model.addAttribute("tags", tags);
        model.addAttribute("feed", feed);
        model.addAttribute("currentUser", currentUser);
        
        // Add favorite info for each article
        for (Article article : articles.getContent()) {
            model.addAttribute("favorited_" + article.getId(), favoriteService.isFavorited(article, currentUser));
            model.addAttribute("favoritesCount_" + article.getId(), favoriteService.getFavoritesCount(article));
        }
        
        return "home";
    }
}
