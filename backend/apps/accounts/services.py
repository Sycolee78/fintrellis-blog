import logging

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)
User = get_user_model()


class AuthService:
    """Stateless service encapsulating authentication business logic."""

    @staticmethod
    def register_user(*, email, password, first_name="", last_name=""):
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=User.Role.READER,
        )
        logger.info("User registered: %s (id=%s)", user.email, user.id)
        return user

    @staticmethod
    def authenticate_user(*, email, password):
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            logger.warning("Login attempt for non-existent email: %s", email)
            return None
        if not user.check_password(password):
            logger.warning("Failed login attempt for: %s", email)
            return None
        if not user.is_active:
            logger.warning("Login attempt for inactive user: %s", email)
            return None
        logger.info("User logged in: %s (id=%s)", user.email, user.id)
        return user

    @staticmethod
    def generate_tokens(user):
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

    @staticmethod
    def refresh_access_token(refresh_token_str):
        """Rotate refresh token: blacklist old, return new access + refresh."""
        old_token = RefreshToken(refresh_token_str)
        user_id = old_token["user_id"]
        old_token.blacklist()
        user = User.objects.get(id=user_id)
        new_refresh = RefreshToken.for_user(user)
        return {
            "access": str(new_refresh.access_token),
            "refresh": str(new_refresh),
        }

    @staticmethod
    def blacklist_refresh_token(refresh_token_str):
        try:
            token = RefreshToken(refresh_token_str)
            token.blacklist()
            logger.info("Refresh token blacklisted.")
            return True
        except Exception:
            logger.warning("Failed to blacklist refresh token.")
            return False
