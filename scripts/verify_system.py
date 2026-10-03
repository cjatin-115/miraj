import asyncio
import sys
import os
from pathlib import Path

# Force UTF-8 stdout if available
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from apps.api.src.core.config import settings
from apps.api.src.core.database import check_db_health, init_db
from apps.api.src.core.redis import check_redis_health
from apps.api.src.core.media import media_env
from apps.api.src.core.storage import get_storage_provider
from apps.api.src.schemas.timeline import TimelineSchema
from apps.api.src.schemas.style import StyleConfigSchema
from apps.api.src.api.v1.styles import MODERN_CREATOR_V1_CONFIG
from apps.api.src.core.ai.factory import get_ai_provider

async def verify_system():
    print("=" * 60)
    print(" MIRAAJ V1 - SYSTEM VERIFICATION MATRIX")
    print("=" * 60)

    # 1. Media Subsystem (FFmpeg / FFprobe)
    print("\n[1/6] Media & Video Processing:")
    if media_env.is_valid:
        print(f"  [OK] FFmpeg Binary : {media_env.ffmpeg_path}")
        print(f"  [OK] FFmpeg Version: {media_env.ffmpeg_version}")
        print(f"  [OK] FFprobe Binary: {media_env.ffprobe_path}")
    else:
        print(f"  [!] FFmpeg: Not detected or invalid in PATH.")

    # 2. Storage Subsystem
    print("\n[2/6] Storage Provider:")
    storage = get_storage_provider()
    storage_ok = storage.is_healthy()
    print(f"  [OK] Provider      : {settings.STORAGE_PROVIDER}")
    print(f"  [OK] Storage Root  : {settings.STORAGE_LOCAL_ROOT}")
    print(f"  [OK] Root Writable : {'YES' if storage_ok else 'NO'}")

    # 3. Redis Queue
    print("\n[3/6] Redis & Queue:")
    redis_health = await check_redis_health()
    if redis_health["status"] == "connected":
        print(f"  [OK] Redis Host    : {settings.REDIS_HOST}:{settings.REDIS_PORT}")
        print(f"  [OK] Connection    : CONNECTED (PONG)")
    else:
        print(f"  [!] Redis Connection: {redis_health.get('message')}")

    # 4. Database Subsystem
    print("\n[4/6] Database Subsystem:")
    await init_db()
    db_health = await check_db_health()
    print(f"  [OK] Database Type : {db_health.get('type')}")
    print(f"  [OK] Status        : {db_health.get('status').upper()} ({db_health.get('message')})")

    # 5. AI Director Subsystem
    print("\n[5/6] AI Director & Provider:")
    ai = get_ai_provider()
    print(f"  [OK] Configured    : {settings.AI_PROVIDER}")
    print(f"  [OK] Provider Type : {type(ai).__name__}")
    analysis = await ai.analyze_script("Miraaj transforms talking head videos into dynamic vertical shorts.")
    print(f"  [OK] Analysis Test : {analysis.word_count} words analyzed, {len(analysis.keywords)} keywords")

    # 6. Schemas & Style System
    print("\n[6/6] Schemas & Style System:")
    style = StyleConfigSchema.model_validate(MODERN_CREATOR_V1_CONFIG)
    print(f"  [OK] Style System  : {style.id} ({style.name})")
    print(f"  [OK] Safe Areas    : Top {style.safeAreas.top}px, Bottom {style.safeAreas.bottom}px")
    print(f"  [OK] Accent Color  : {style.captions.highlightTextColor}")

    print("\n" + "=" * 60)
    all_ok = media_env.is_valid and storage_ok and redis_health["status"] == "connected" and db_health["status"] == "connected"
    if all_ok:
        print(" ALL CORE SUBSYSTEMS OPERATIONAL! READY FOR DEVELOPMENT.")
    else:
        print(" SYSTEM INITIALIZED WITH WARNINGS (Check details above).")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(verify_system())
