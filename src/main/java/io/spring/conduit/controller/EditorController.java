package io.spring.conduit.controller;

import io.spring.conduit.domain.Article;
import io.spring.conduit.domain.Tag;
import io.spring.conduit.domain.User;
import io.spring.conduit.service.ArticleService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/editor")
public class EditorController {

    private final ArticleService articleService;

    public EditorController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping
    public String newArticle(@AuthenticationPrincipal User currentUser, Model model) {
        if (currentUser == null) {
            return "redirect:/login";
        }
        
        model.addAttribute("currentUser", currentUser);
        model.addAttribute("isEdit", false);
        return "article/editor";
    }

    @GetMapping("/{slug}")
    public String editArticle(@PathVariable String slug,
                             @AuthenticationPrincipal User currentUser,
                             Model model) {
        if (currentUser == null) {
            return "redirect:/login";
        }
        
        Optional<Article> articleOptional = articleService.findBySlug(slug);
        if (articleOptional.isEmpty()) {
            return "redirect:/";
        }
        
        Article article = articleOptional.get();
        if (!currentUser.getUsername().equals(article.getAuthor().getUsername())) {
            return "redirect:/";
        }
        
        model.addAttribute("article", article);
        model.addAttribute("currentUser", currentUser);
        model.addAttribute("isEdit", true);
        model.addAttribute("tagList", article.getTags().stream()
                .map(Tag::getName)
                .collect(Collectors.joining(",")));
        
        return "article/editor";
    }

    @PostMapping
    public String createArticle(@RequestParam String title,
                               @RequestParam String description,
                               @RequestParam String body,
                               @RequestParam(required = false) String tags,
                               @AuthenticationPrincipal User currentUser,
                               RedirectAttributes redirectAttributes) {
        if (currentUser == null) {
            return "redirect:/login";
        }
        
        try {
            List<String> tagList = tags != null && !tags.isEmpty() 
                    ? Arrays.asList(tags.split(","))
                    : List.of();
            
            Article article = articleService.create(title, description, body, tagList, currentUser);
            return "redirect:/article/" + article.getSlug();
        } catch (Exception e) {
            Map<String, String> errors = new HashMap<>();
            errors.put("article", e.getMessage());
            redirectAttributes.addFlashAttribute("errors", errors);
            return "redirect:/editor";
        }
    }

    @PostMapping("/{slug}")
    public String updateArticle(@PathVariable String slug,
                               @RequestParam String title,
                               @RequestParam String description,
                               @RequestParam String body,
                               @RequestParam(required = false) String tags,
                               @AuthenticationPrincipal User currentUser,
                               RedirectAttributes redirectAttributes) {
        if (currentUser == null) {
            return "redirect:/login";
        }
        
        Optional<Article> articleOptional = articleService.findBySlug(slug);
        if (articleOptional.isEmpty()) {
            return "redirect:/";
        }
        
        Article article = articleOptional.get();
        if (!currentUser.getUsername().equals(article.getAuthor().getUsername())) {
            return "redirect:/";
        }
        
        try {
            List<String> tagList = tags != null && !tags.isEmpty() 
                    ? Arrays.asList(tags.split(","))
                    : List.of();
            
            Article updatedArticle = articleService.update(article, title, description, body, tagList);
            return "redirect:/article/" + updatedArticle.getSlug();
        } catch (Exception e) {
            Map<String, String> errors = new HashMap<>();
            errors.put("article", e.getMessage());
            redirectAttributes.addFlashAttribute("errors", errors);
            return "redirect:/editor/" + slug;
        }
    }
}
