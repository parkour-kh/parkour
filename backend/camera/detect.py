"""Detection entry point."""
from camera import open_camera
from roi import crop


def main():
    cap = open_camera()
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            # TODO: detection logic
    finally:
        cap.release()


if __name__ == "__main__":
    main()
