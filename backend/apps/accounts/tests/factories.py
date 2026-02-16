import factory
from django.contrib.auth import get_user_model

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    role = "reader"
    is_active = True

    @factory.lazy_attribute
    def password(self):
        return "testpass1234"

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        password = kwargs.pop("password", "testpass1234")
        user = model_class(**kwargs)
        user.set_password(password)
        user.save()
        return user

    class Params:
        admin = factory.Trait(
            role="admin",
            is_staff=True,
            is_superuser=True,
        )
        author = factory.Trait(role="author")
