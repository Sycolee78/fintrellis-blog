import factory
from django.utils import timezone

from apps.accounts.tests.factories import UserFactory
from apps.posts.models import Post


class PostFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Post

    title = factory.Sequence(lambda n: f"Test Post {n}")
    slug = factory.Sequence(lambda n: f"test-post-{n}")
    content = factory.Faker("paragraph", nb_sentences=5)
    excerpt = factory.Faker("sentence")
    category = factory.Faker("word")
    status = Post.Status.DRAFT
    author = factory.SubFactory(UserFactory, role="author")

    class Params:
        published = factory.Trait(
            status=Post.Status.PUBLISHED,
            published_at=factory.LazyFunction(timezone.now),
        )
