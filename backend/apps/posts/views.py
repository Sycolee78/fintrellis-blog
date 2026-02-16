from rest_framework import permissions, status
from rest_framework.generics import get_object_or_404
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsOwner

from .filters import PostFilter
from .models import Post
from .serializers import PostDetailSerializer, PostListSerializer
from .services import PostService


class PostListCreateView(APIView):
    """
    GET  /api/v1/posts/  — List posts (paginated, filterable, searchable).
    POST /api/v1/posts/  — Create a new post (supports multipart for thumbnail).
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        queryset = PostService.list_posts()

        # Apply django-filter
        filterset = PostFilter(request.query_params, queryset=queryset)
        queryset = filterset.qs

        # Search
        search = request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(title__icontains=search)

        # Ordering
        ordering = request.query_params.get("ordering", "-created_at")
        allowed_ordering = {
            "created_at", "-created_at", "title", "-title",
            "published_at", "-published_at",
        }
        if ordering in allowed_ordering:
            queryset = queryset.order_by(ordering)

        # Pagination
        from common.pagination import StandardPagination

        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = PostListSerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = PostDetailSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        post = PostService.create_post(
            title=serializer.validated_data["title"],
            content=serializer.validated_data["content"],
            author=request.user,
            excerpt=serializer.validated_data.get("excerpt", ""),
            category=serializer.validated_data.get("category", ""),
            status=serializer.validated_data.get("status", "draft"),
            thumbnail=serializer.validated_data.get("thumbnail"),
            image_url=serializer.validated_data.get("image_url", ""),
        )

        output = PostDetailSerializer(post, context={"request": request})
        return Response(output.data, status=status.HTTP_201_CREATED)


class PostDetailView(APIView):
    """
    GET    /api/v1/posts/{id}/  — Retrieve a single post.
    PUT    /api/v1/posts/{id}/  — Full update.
    PATCH  /api/v1/posts/{id}/  — Partial update.
    DELETE /api/v1/posts/{id}/  — Delete.
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [IsOwner()]
        return [permissions.IsAuthenticated()]

    def _get_post(self, pk):
        return get_object_or_404(Post, pk=pk)

    def get(self, request, pk):
        post = self._get_post(pk)
        serializer = PostDetailSerializer(post, context={"request": request})
        return Response(serializer.data)

    def put(self, request, pk):
        post = self._get_post(pk)
        self.check_object_permissions(request, post)
        serializer = PostDetailSerializer(
            post, data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        updated = PostService.update_post(post, data=serializer.validated_data)
        output = PostDetailSerializer(updated, context={"request": request})
        return Response(output.data)

    def patch(self, request, pk):
        post = self._get_post(pk)
        self.check_object_permissions(request, post)
        serializer = PostDetailSerializer(
            post, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        updated = PostService.update_post(post, data=serializer.validated_data)
        output = PostDetailSerializer(updated, context={"request": request})
        return Response(output.data)

    def delete(self, request, pk):
        post = self._get_post(pk)
        self.check_object_permissions(request, post)
        PostService.delete_post(post)
        return Response(status=status.HTTP_204_NO_CONTENT)
