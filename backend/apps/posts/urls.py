from django.urls import path

from . import views

urlpatterns = [
    path("posts/", views.PostListCreateView.as_view(), name="post-list"),
    path("posts/<uuid:pk>/", views.PostDetailView.as_view(), name="post-detail"),
]
