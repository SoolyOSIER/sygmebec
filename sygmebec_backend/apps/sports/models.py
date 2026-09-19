from math import ceil

from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from sygmebec_backend.apps.core.models import SoftDeleteModel, TimeStampedModel


class SportsCategory(TimeStampedModel):
    """A newsroom section, independent from the sport played in an article."""

    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=96, unique=True)
    description = models.CharField(max_length=280, blank=True)
    color = models.CharField(max_length=7, blank=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['sort_order', 'name']
        verbose_name = 'Catégorie sportive'
        verbose_name_plural = 'Catégories sportives'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:96] or 'categorie'
        super().save(*args, **kwargs)


class SportsArticle(SoftDeleteModel):
    """A newsroom article that can be prepared before public publication."""

    DRAFT = 'DRAFT'
    PUBLISHED = 'PUBLISHED'
    STATUS_CHOICES = [
        (DRAFT, 'Brouillon'),
        (PUBLISHED, 'Publié'),
    ]

    title = models.CharField(max_length=240)
    slug = models.SlugField(max_length=270, unique=True)
    excerpt = models.CharField(max_length=700, blank=True)
    body = models.TextField()
    category = models.ForeignKey(
        SportsCategory,
        on_delete=models.PROTECT,
        related_name='articles',
    )
    sport = models.CharField(max_length=80, db_index=True)
    country = models.CharField(max_length=100, blank=True, db_index=True)
    haiti_focus = models.BooleanField(default=False, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default=DRAFT, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)
    cover_image_url = models.URLField(max_length=900, blank=True)
    source_url = models.URLField(max_length=900, blank=True)
    video_url = models.URLField(max_length=900, blank=True)
    tags = models.JSONField(default=list, blank=True)
    author = models.ForeignKey(
        'accounts.Utilisateur',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='sports_articles',
    )
    reading_time = models.PositiveSmallIntegerField(default=1)
    views = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-published_at', '-created_at']
        verbose_name = 'Article sportif'
        verbose_name_plural = 'Articles sportifs'
        indexes = [
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['is_featured', 'status', 'published_at']),
            models.Index(fields=['haiti_focus', 'status', 'published_at']),
        ]

    def __str__(self):
        return self.title

    @property
    def is_public(self):
        return self.status == self.PUBLISHED and self.published_at and self.published_at <= timezone.now()

    def _make_unique_slug(self):
        base = slugify(self.slug or self.title)[:250] or 'article-sportif'
        candidate = base
        number = 2
        queryset = type(self).all_objects.exclude(pk=self.pk)
        while queryset.filter(slug=candidate).exists():
            suffix = f'-{number}'
            candidate = f'{base[:270 - len(suffix)]}{suffix}'
            number += 1
        return candidate

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._make_unique_slug()
        if self.status == self.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()
        words = len((self.body or '').split())
        self.reading_time = max(1, ceil(words / 220))
        super().save(*args, **kwargs)
