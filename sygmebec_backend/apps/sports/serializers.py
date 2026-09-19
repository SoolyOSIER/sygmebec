from urllib.parse import urlparse

from rest_framework import serializers

from .models import SportsArticle, SportsCategory


class SportsCategorySerializer(serializers.ModelSerializer):
    article_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = SportsCategory
        fields = [
            'id', 'name', 'slug', 'description', 'color', 'sort_order',
            'is_active', 'article_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'article_count']
        extra_kwargs = {'slug': {'required': False}}

    def validate_color(self, value):
        if value and (len(value) != 7 or not value.startswith('#')):
            raise serializers.ValidationError('Utilisez une couleur hexadécimale, par exemple #0B4F9C.')
        if value:
            try:
                int(value[1:], 16)
            except ValueError as error:
                raise serializers.ValidationError('Utilisez une couleur hexadécimale valide.') from error
        return value


class SportsArticleSerializer(serializers.ModelSerializer):
    # The editor selects a category by its numeric id while public clients use
    # ``category_detail.slug`` for readable URLs and filters.
    category = serializers.PrimaryKeyRelatedField(
        queryset=SportsCategory.objects.filter(is_active=True),
    )
    category_detail = SportsCategorySerializer(source='category', read_only=True)
    author_name = serializers.SerializerMethodField()
    # Keep a narrow input alias for the first version of the vitrine editor.
    # ``cover_image_url`` remains the single canonical response field.
    cover_image = serializers.URLField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = SportsArticle
        fields = [
            'id', 'slug', 'title', 'excerpt', 'body', 'category', 'category_detail',
            'sport', 'country', 'haiti_focus', 'is_featured', 'status', 'published_at',
            'cover_image_url', 'cover_image', 'source_url', 'video_url', 'author', 'author_name', 'tags',
            'reading_time', 'views', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'author', 'author_name', 'reading_time', 'views', 'created_at', 'updated_at',
        ]
        extra_kwargs = {
            'slug': {'required': False},
            'excerpt': {'required': False, 'allow_blank': True},
            'country': {'required': False, 'allow_blank': True},
            'cover_image_url': {'required': False, 'allow_blank': True},
            'source_url': {'required': False, 'allow_blank': True},
            'video_url': {'required': False, 'allow_blank': True},
        }

    def get_author_name(self, article):
        return article.author.identifiant if article.author_id else 'Rédaction Globe Info Sport'

    def validate_tags(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError('Les étiquettes doivent être une liste.')
        tags = []
        seen = set()
        for raw_tag in value:
            tag = str(raw_tag).strip()
            if not tag:
                continue
            if len(tag) > 40:
                raise serializers.ValidationError('Chaque étiquette doit contenir au plus 40 caractères.')
            key = tag.casefold()
            if key not in seen:
                tags.append(tag)
                seen.add(key)
        if len(tags) > 12:
            raise serializers.ValidationError('Ajoutez au plus 12 étiquettes par article.')
        return tags

    def validate(self, attrs):
        legacy_cover_image = attrs.pop('cover_image', serializers.empty)
        if legacy_cover_image is not serializers.empty:
            canonical_cover_image = attrs.get('cover_image_url')
            if canonical_cover_image and canonical_cover_image != legacy_cover_image:
                raise serializers.ValidationError({
                    'cover_image': 'Utilisez soit cover_image_url, soit cover_image, avec la même adresse.',
                })
            attrs['cover_image_url'] = legacy_cover_image
        for field in ('cover_image_url', 'source_url', 'video_url'):
            value = attrs.get(field)
            if value and urlparse(value).scheme not in {'http', 'https'}:
                raise serializers.ValidationError({field: 'Utilisez une adresse http:// ou https://.'})
        return attrs

    def create(self, validated_data):
        if not validated_data.get('slug'):
            validated_data.pop('slug', None)
        return super().create(validated_data)
