from django.db.models import Count, F, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from sygmebec_backend.apps.core.audit import log_audit

from .models import SportsArticle, SportsCategory
from .permissions import IsSportsEditor
from .serializers import SportsArticleSerializer, SportsCategorySerializer


def public_articles_queryset():
    """Only articles deliberately published in the past or present are public."""
    return SportsArticle.objects.filter(
        status=SportsArticle.PUBLISHED,
        published_at__isnull=False,
        published_at__lte=timezone.now(),
    )


def category_queryset(public_only=False):
    published_filter = Q(
        articles__status=SportsArticle.PUBLISHED,
        articles__published_at__isnull=False,
        articles__published_at__lte=timezone.now(),
        articles__deleted_at__isnull=True,
    )
    queryset = SportsCategory.objects.annotate(article_count=Count('articles', filter=published_filter))
    return queryset.filter(is_active=True) if public_only else queryset


def article_audit_snapshot(article):
    """Keep useful metadata in the audit trail without storing article copy."""
    return {
        'title': article.title,
        'slug': article.slug,
        'category': article.category.slug,
        'sport': article.sport,
        'country': article.country,
        'haiti_focus': article.haiti_focus,
        'is_featured': article.is_featured,
        'status': article.status,
        'published_at': article.published_at,
    }


class SportsCategoryViewSet(viewsets.ModelViewSet):
    """Publicly readable newsroom sections, managed by editorial users."""

    serializer_class = SportsCategorySerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'sort_order', 'created_at']
    ordering = ['sort_order', 'name']

    def is_editor(self):
        return IsSportsEditor().has_permission(self.request, self)

    def get_permissions(self):
        if self.action in {'list', 'retrieve'}:
            return [AllowAny()]
        return [IsSportsEditor()]

    def get_queryset(self):
        return category_queryset(public_only=not self.is_editor())

    def perform_create(self, serializer):
        category = serializer.save()
        log_audit(
            action='SPORT_CATEGORY_CREATED', module='SPORTS', actor=self.request.user, request=self.request,
            target=category, target_label=category.name,
            after_data={'name': category.name, 'slug': category.slug, 'is_active': category.is_active},
            summary=f'Rubrique sportive créée : {category.name}',
        )

    def perform_update(self, serializer):
        before = {'name': serializer.instance.name, 'slug': serializer.instance.slug, 'is_active': serializer.instance.is_active}
        category = serializer.save()
        log_audit(
            action='SPORT_CATEGORY_UPDATED', module='SPORTS', actor=self.request.user, request=self.request,
            target=category, target_label=category.name, before_data=before,
            after_data={'name': category.name, 'slug': category.slug, 'is_active': category.is_active},
            summary=f'Rubrique sportive mise à jour : {category.name}',
        )

    def perform_destroy(self, instance):
        # Preserve existing article classifications and simply hide the section.
        instance.is_active = False
        instance.save(update_fields=['is_active', 'updated_at'])
        log_audit(
            action='SPORT_CATEGORY_ARCHIVED', module='SPORTS', actor=self.request.user, request=self.request,
            target=instance, target_label=instance.name,
            before_data={'is_active': True}, after_data={'is_active': False},
            summary=f'Rubrique sportive archivée : {instance.name}',
        )


class SportsArticleViewSet(viewsets.ModelViewSet):
    """Globe Info Sport newsroom API: public reading, protected publication."""

    serializer_class = SportsArticleSerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'excerpt', 'body', 'sport', 'country', 'tags']
    ordering_fields = ['published_at', 'created_at', 'title', 'views', 'reading_time']
    ordering = ['-published_at', '-created_at']

    def is_editor(self):
        return IsSportsEditor().has_permission(self.request, self)

    def get_permissions(self):
        if self.action in {'list', 'retrieve', 'featured'}:
            return [AllowAny()]
        return [IsSportsEditor()]

    def _apply_public_filters(self, queryset):
        category = self.request.query_params.get('category')
        sport = self.request.query_params.get('sport')
        country = self.request.query_params.get('country')
        haiti_focus = self.request.query_params.get('haiti_focus')
        featured = self.request.query_params.get('featured')
        if category:
            queryset = queryset.filter(category__slug=category)
        if sport:
            queryset = queryset.filter(sport__iexact=sport)
        if country:
            queryset = queryset.filter(country__iexact=country)
        if haiti_focus in {'true', '1'}:
            queryset = queryset.filter(haiti_focus=True)
        elif haiti_focus in {'false', '0'}:
            queryset = queryset.filter(haiti_focus=False)
        if featured in {'true', '1'}:
            queryset = queryset.filter(is_featured=True)
        elif featured in {'false', '0'}:
            queryset = queryset.filter(is_featured=False)
        return queryset

    def get_queryset(self):
        if self.action in {'trash', 'restore'}:
            return SportsArticle.all_objects.select_related('category', 'author', 'deleted_by')
        queryset = SportsArticle.objects.select_related('category', 'author')
        if not self.is_editor():
            queryset = public_articles_queryset().select_related('category', 'author')
        elif self.request.query_params.get('mine') in {'true', '1'}:
            queryset = queryset.filter(author=self.request.user)
        return self._apply_public_filters(queryset)

    def get_object(self):
        """Accept the durable slug and the numeric id used by the editor UI."""
        queryset = self.filter_queryset(self.get_queryset())
        lookup_value = self.kwargs.get(self.lookup_url_kwarg or self.lookup_field)
        lookup = Q(slug=lookup_value)
        if str(lookup_value).isdigit():
            lookup |= Q(pk=int(lookup_value))
        article = get_object_or_404(queryset, lookup)
        self.check_object_permissions(self.request, article)
        return article

    def perform_create(self, serializer):
        article = serializer.save(author=self.request.user)
        log_audit(
            action='SPORT_ARTICLE_CREATED', module='SPORTS', actor=self.request.user, request=self.request,
            target=article, target_label=article.title, after_data=article_audit_snapshot(article),
            summary=f'Article sportif créé : {article.title}',
        )

    def perform_update(self, serializer):
        before = article_audit_snapshot(serializer.instance)
        article = serializer.save()
        log_audit(
            action='SPORT_ARTICLE_UPDATED', module='SPORTS', actor=self.request.user, request=self.request,
            target=article, target_label=article.title, before_data=before,
            after_data=article_audit_snapshot(article),
            summary=f'Article sportif mis à jour : {article.title}',
        )

    def perform_destroy(self, instance):
        instance.soft_delete(self.request.user)
        log_audit(
            action='SPORT_ARTICLE_ARCHIVED', module='SPORTS', actor=self.request.user, request=self.request,
            target=instance, target_label=instance.title,
            before_data=article_audit_snapshot(instance),
            summary=f'Article sportif archivé : {instance.title}',
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # A visit is a public metric, never an editorial audit event.
        if not self.is_editor():
            SportsArticle.objects.filter(pk=instance.pk).update(views=F('views') + 1)
            instance.refresh_from_db(fields=['views'])
        return Response(self.get_serializer(instance).data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def featured(self, request):
        queryset = self._apply_public_filters(public_articles_queryset().select_related('category', 'author'))
        queryset = queryset.filter(is_featured=True)[:8]
        return Response(self.get_serializer(queryset, many=True).data)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        queryset = SportsArticle.objects.select_related('category', 'author')
        payload = {
            'total_articles': queryset.count(),
            'published_articles': queryset.filter(status=SportsArticle.PUBLISHED).count(),
            'draft_articles': queryset.filter(status=SportsArticle.DRAFT).count(),
            'featured_articles': queryset.filter(is_featured=True, status=SportsArticle.PUBLISHED).count(),
            'haiti_focus_articles': queryset.filter(haiti_focus=True, status=SportsArticle.PUBLISHED).count(),
            'categories': SportsCategory.objects.filter(is_active=True).count(),
            'latest_drafts': self.get_serializer(queryset.filter(status=SportsArticle.DRAFT)[:5], many=True).data,
            'latest_published': self.get_serializer(queryset.filter(status=SportsArticle.PUBLISHED)[:5], many=True).data,
        }
        return Response(payload)

    @action(detail=True, methods=['post'])
    def publish(self, request, slug=None):
        article = self.get_object()
        article.status = SportsArticle.PUBLISHED
        article.published_at = timezone.now()
        article.save(update_fields=['status', 'published_at', 'updated_at'])
        log_audit(
            action='SPORT_ARTICLE_PUBLISHED', module='SPORTS', actor=request.user, request=request,
            target=article, target_label=article.title, after_data=article_audit_snapshot(article),
            summary=f'Article sportif publié : {article.title}',
        )
        return Response(self.get_serializer(article).data)

    @action(detail=True, methods=['post'])
    def unpublish(self, request, slug=None):
        article = self.get_object()
        article.status = SportsArticle.DRAFT
        article.published_at = None
        article.save(update_fields=['status', 'published_at', 'updated_at'])
        log_audit(
            action='SPORT_ARTICLE_UNPUBLISHED', module='SPORTS', actor=request.user, request=request,
            target=article, target_label=article.title, after_data=article_audit_snapshot(article),
            summary=f'Article sportif retiré de la publication : {article.title}',
        )
        return Response(self.get_serializer(article).data)

    @action(detail=False, methods=['get'])
    def trash(self, request):
        queryset = self.get_queryset().filter(deleted_at__isnull=False)
        return Response(self.get_serializer(queryset, many=True).data)

    @action(detail=True, methods=['post'])
    def restore(self, request, slug=None):
        article = self.get_object()
        if article.deleted_at is not None:
            article.restore()
            log_audit(
                action='SPORT_ARTICLE_RESTORED', module='SPORTS', actor=request.user, request=request,
                target=article, target_label=article.title, after_data=article_audit_snapshot(article),
                summary=f'Article sportif restauré : {article.title}',
            )
        return Response(self.get_serializer(article).data, status=status.HTTP_200_OK)
