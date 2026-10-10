"""Region-of-interest helpers."""


def crop(frame, roi):
    """Crop frame to roi = (x, y, w, h)."""
    x, y, w, h = roi
    return frame[y:y + h, x:x + w]
