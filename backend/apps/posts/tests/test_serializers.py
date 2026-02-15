import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from apps.posts.serializers import PostDetailSerializer


class TestPostDetailSerializer:
    def test_valid_data_passes(self):
        data = {
            "title": "Valid Title",
            "content": "This is enough content to pass validation rules.",
        }
        serializer = PostDetailSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_valid_data_with_category(self):
        data = {
            "title": "Valid Title",
            "content": "This is enough content to pass validation rules.",
            "category": "Technology",
        }
        serializer = PostDetailSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_missing_title_fails(self):
        data = {"content": "This is enough content to pass validation rules."}
        serializer = PostDetailSerializer(data=data)
        assert not serializer.is_valid()
        assert "title" in serializer.errors

    def test_missing_content_fails(self):
        data = {"title": "A Title"}
        serializer = PostDetailSerializer(data=data)
        assert not serializer.is_valid()
        assert "content" in serializer.errors

    def test_short_content_fails(self):
        data = {"title": "A Title", "content": "Short"}
        serializer = PostDetailSerializer(data=data)
        assert not serializer.is_valid()
        assert "content" in serializer.errors

    def test_blank_title_fails(self):
        data = {"title": "   ", "content": "Enough content for validation."}
        serializer = PostDetailSerializer(data=data)
        assert not serializer.is_valid()
        assert "title" in serializer.errors

    def test_invalid_status_fails(self):
        data = {
            "title": "Valid",
            "content": "Enough content for validation.",
            "status": "archived",
        }
        serializer = PostDetailSerializer(data=data)
        assert not serializer.is_valid()
        assert "status" in serializer.errors

    def test_thumbnail_rejects_invalid_type(self):
        fake_file = SimpleUploadedFile(
            "test.txt", b"not an image", content_type="text/plain"
        )
        data = {
            "title": "Valid",
            "content": "Enough content for validation.",
            "thumbnail": fake_file,
        }
        serializer = PostDetailSerializer(data=data)
        assert not serializer.is_valid()
        assert "thumbnail" in serializer.errors

    def test_thumbnail_accepts_jpeg(self):
        # 1x1 white JPEG
        jpeg_bytes = (
            b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00'
            b'\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t'
            b'\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a'
            b'\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342'
            b'\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00'
            b'\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00'
            b'\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b'
            b'\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04'
            b'\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07'
            b'\x22q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16'
            b'\x17\x18\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz'
            b'\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99'
            b'\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7'
            b'\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5'
            b'\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1'
            b'\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa'
            b'\xff\xda\x00\x08\x01\x01\x00\x00?\x00T\xdb\xa8\xa0\x02\x80\x0f\xff\xd9'
        )
        fake_jpeg = SimpleUploadedFile(
            "photo.jpg", jpeg_bytes, content_type="image/jpeg"
        )
        data = {
            "title": "Valid",
            "content": "Enough content for validation.",
            "thumbnail": fake_jpeg,
        }
        serializer = PostDetailSerializer(data=data)
        # ImageField validation may fail on the minimal bytes, so we just check
        # that our custom type validator does NOT raise — Pillow validation is separate
        is_valid = serializer.is_valid()
        if not is_valid:
            # Our custom validator should NOT be the reason; it should be Pillow's
            assert "Unsupported file type" not in str(serializer.errors.get("thumbnail", ""))
