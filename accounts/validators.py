import re

from django.core.exceptions import ValidationError

_PATTERN = re.compile(r"^(?:\+?254|0)([17]\d{8})$")


def normalize_phone(value):
    """Return a Kenyan number as 2547XXXXXXXX (the format M-Pesa/Daraja expects)."""
    cleaned = re.sub(r"[\s\-()]", "", str(value))
    match = _PATTERN.match(cleaned)
    if not match:
        raise ValidationError("Enter a valid Kenyan phone number, e.g. 0712345678.")
    return "254" + match.group(1)
