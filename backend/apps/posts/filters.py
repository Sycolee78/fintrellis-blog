from django_filters import rest_framework as filters

from .models import Post


class PostFilter(filters.FilterSet):
    status = filters.ChoiceFilter(choices=Post.Status.choices)
    created_after = filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_before = filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")

    category = filters.CharFilter(lookup_expr="iexact")

    class Meta:
        model = Post
        fields = ["status", "category", "created_after", "created_before"]
