from django.contrib import admin

from .models import SportsArticle, SportsCategory


@admin.register(SportsCategory)
class SportsCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'sort_order')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(SportsArticle)
class SportsArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'sport', 'country', 'status', 'haiti_focus', 'is_featured', 'published_at', 'views')
    list_filter = ('status', 'haiti_focus', 'is_featured', 'category', 'sport')
    search_fields = ('title', 'excerpt', 'body', 'country', 'tags')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('reading_time', 'views', 'created_at', 'updated_at', 'deleted_at', 'deleted_by')
    autocomplete_fields = ('category', 'author', 'deleted_by')
