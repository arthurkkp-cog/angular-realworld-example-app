package io.spring.conduit.service;

import io.spring.conduit.domain.Tag;
import io.spring.conduit.repository.TagRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    public List<String> getAllTags() {
        return tagRepository.findAllOrderByPopularity().stream()
                .map(Tag::getName)
                .collect(Collectors.toList());
    }
}
