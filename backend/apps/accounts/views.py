from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer
from .services import AuthService
from .throttles import AuthRateThrottle, RegisterRateThrottle


def _set_refresh_cookie(response, refresh_token):
    """Set the refresh token as an HttpOnly cookie."""
    jwt_settings = settings.SIMPLE_JWT
    response.set_cookie(
        key=jwt_settings["AUTH_COOKIE"],
        value=refresh_token,
        httponly=jwt_settings["AUTH_COOKIE_HTTP_ONLY"],
        secure=jwt_settings["AUTH_COOKIE_SECURE"],
        samesite=jwt_settings["AUTH_COOKIE_SAMESITE"],
        path=jwt_settings["AUTH_COOKIE_PATH"],
        max_age=int(jwt_settings["REFRESH_TOKEN_LIFETIME"].total_seconds()),
    )
    return response


def _delete_refresh_cookie(response):
    """Delete the refresh token cookie."""
    jwt_settings = settings.SIMPLE_JWT
    response.delete_cookie(
        key=jwt_settings["AUTH_COOKIE"],
        path=jwt_settings["AUTH_COOKIE_PATH"],
    )
    return response


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [RegisterRateThrottle]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = AuthService.register_user(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
            first_name=serializer.validated_data.get("first_name", ""),
            last_name=serializer.validated_data.get("last_name", ""),
        )
        tokens = AuthService.generate_tokens(user)
        response = Response(
            {"user": UserSerializer(user).data, "access": tokens["access"]},
            status=status.HTTP_201_CREATED,
        )
        return _set_refresh_cookie(response, tokens["refresh"])


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = AuthService.authenticate_user(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            return Response(
                {
                    "error": {
                        "code": "AUTHENTICATION_FAILED",
                        "message": "Invalid email or password.",
                        "details": {},
                    }
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
        tokens = AuthService.generate_tokens(user)
        response = Response(
            {"user": UserSerializer(user).data, "access": tokens["access"]}
        )
        return _set_refresh_cookie(response, tokens["refresh"])


class RefreshView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE"])
        if not refresh_token:
            return Response(
                {
                    "error": {
                        "code": "AUTHENTICATION_FAILED",
                        "message": "No refresh token provided.",
                        "details": {},
                    }
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
        try:
            tokens = AuthService.refresh_access_token(refresh_token)
            response = Response({"access": tokens["access"]})
            return _set_refresh_cookie(response, tokens["refresh"])
        except TokenError:
            response = Response(
                {
                    "error": {
                        "code": "AUTHENTICATION_FAILED",
                        "message": "Invalid or expired refresh token.",
                        "details": {},
                    }
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
            return _delete_refresh_cookie(response)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE"])
        if refresh_token:
            AuthService.blacklist_refresh_token(refresh_token)
        response = Response(status=status.HTTP_204_NO_CONTENT)
        return _delete_refresh_cookie(response)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
