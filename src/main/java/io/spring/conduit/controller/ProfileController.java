package io.spring.conduit.controller;

import io.spring.conduit.domain.Article;
import io.spring.conduit.domain.User;
import io.spring.conduit.service.ArticleService;
import io.spring.conduit.service.FavoriteService;
import io.spring.conduit.service.ProfileService;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
@RequestMapping("/profile")
public class ProfileController {

    private final ProfileService profileService;
    private final ArticleService articleService;
    private final FavoriteService favoriteService;

    public ProfileController(ProfileService profileService, ArticleService articleService,
                            FavoriteService favoriteService) {
        this.profileService = profileService;
        this.articleService = articleService;
        this.favoriteService = favoriteService;
    }

    @GetMapping("/{username}")
    public String viewProfile(@PathVariable String username,
                             @RequestParam(defaultValue = "articles") String tab,
                             @RequestParam(defaultValue = "0") int page,
                             @RequestParam(defaultValue = "10") int size,
                             @AuthenticationPrincipal User currentUser,
                             Model model) {
        Optional<User> profileUserOptional = profileService.findByUsername(username);
        
        if (profileUserOptional.isEmpty()) {
            return "redirect:/";
        }
        
        User profileUser = profileUserOptional.get();
        Page<Article> articles;
        
        if ("favorites".equals(tab)) {
            articles = articleService.findFavoritedBy(username, page, size);
        } else {
            articles = articleService.findByAuthor(username, page, size);
        }
        
        model.addAttribute("profile", profileUser);
        model.addAttribute("articles", articles.getContent());
        model.addAttribute("articlesCount", articles.getTotalElements());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", articles.getTotalPages());
        model.addAttribute("tab", tab);
        model.addAttribute("currentUser", currentUser);
        model.addAttribute("isUser", currentUser != null && 
                currentUser.getUsername().equals(profileUser.getUsername()));
        model.addAttribute("following", currentUser != null && 
                profileService.isFollowing(currentUser, profileUser));
        
        // Add favorite info for each article
        for (Article article : articles.getContent()) {
            model.addAttribute("favorited_" + article.getId(), favoriteService.isFavorited(article, currentUser));
            model.addAttribute("favoritesCount_" + article.getId(), favoriteService.getFavoritesCount(article));
        }
        
        return "profile";
    }

    @PostMapping("/{username}/follow")
    public String follow(@PathVariable String username,
                        @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return "redirect:/login";
        }
        
        Optional<User> profileUserOptional = profileService.findByUsername(username);
        if (profileUserOptional.isPresent()) {
            profileService.follow(currentUser, profileUserOptional.get());
        }
        
        return "redirect:/profile/" + username;
    }

    @PostMapping("/{username}/unfollow")
    public String unfollow(@PathVariable String username,
                          @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return "redirect:/login";
        }
        
        Optional<User> profileUserOptional = profileService.findByUsername(username);
        if (profileUserOptional.isPresent()) {
            profileService.unfollow(currentUser, profileUserOptional.get());
        }
        
        return "redirect:/profile/" + username;
    }
}
