#!/usr/bin/env python3
"""Record a web session video via Playwright (Arka browser stack)."""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

URL = "http://localhost:5174"
OUTPUT = Path(__file__).resolve().parent
STEPS = OUTPUT / "automation-steps.json"


def main() -> int:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Install: pip install playwright && playwright install chromium", file=sys.stderr)
        return 2

    steps = json.loads(STEPS.read_text(encoding="utf-8"))
    video_dir = OUTPUT / "video"
    frames_dir = OUTPUT / "video-frames"
    video_dir.mkdir(parents=True, exist_ok=True)
    if frames_dir.exists():
        shutil.rmtree(frames_dir)
    frames_dir.mkdir(parents=True)

    errors: list[str] = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            record_video_dir=str(video_dir),
            record_video_size={"width": 1440, "height": 900},
        )
        page = context.new_page()
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda msg: errors.append(f"console.{msg.type}: {msg.text}") if msg.type == "error" else None)
        page.goto(URL, wait_until="load", timeout=30_000)
        page.wait_for_timeout(2500)

        for i, step in enumerate(steps, 1):
            action = step["action"]
            if action == "wait":
                page.wait_for_timeout(min(30_000, max(0, int(step.get("ms", 500)))))
            elif action == "click":
                page.locator(step["selector"]).click(timeout=15_000)
            elif action == "assert_text":
                page.locator(step["selector"]).get_by_text(str(step.get("text", "")), exact=False).wait_for(timeout=15_000)
            elif action == "screenshot":
                name = str(step.get("name", f"frame-{i}.png"))
                page.screenshot(path=str(frames_dir / name))
            elif action == "wheel":
                selector = step.get("selector", "canvas")
                page.locator(selector).hover(timeout=15_000)
                page.mouse.wheel(int(step.get("deltaX", 0)), int(step.get("deltaY", -600)))

        page.wait_for_timeout(1500)
        video_path = Path(page.video.path()) if page.video else None
        context.close()
        browser.close()

    if not video_path or not video_path.exists():
        candidates = sorted(video_dir.glob("*.webm"), key=lambda p: p.stat().st_mtime, reverse=True)
        video_path = candidates[0] if candidates else None

    report = {
        "url": URL,
        "video": str(video_path.resolve()) if video_path else None,
        "console_errors": errors,
        "frames_dir": str(frames_dir.resolve()),
    }

    if video_path and shutil.which("ffmpeg"):
        mp4 = OUTPUT / "session-recording.mp4"
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(video_path), "-c:v", "libx264", "-pix_fmt", "yuv420p", str(mp4)],
            check=False,
            capture_output=True,
        )
        if mp4.exists():
            report["mp4"] = str(mp4.resolve())
            subprocess.run(
                ["ffmpeg", "-y", "-i", str(mp4), "-vf", "fps=1/3", str(frames_dir / "vid-%03d.png")],
                check=False,
                capture_output=True,
            )

    (OUTPUT / "video-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
