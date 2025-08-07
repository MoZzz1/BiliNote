import re


import re

import re

from app.utils.logger import get_logger

logger = get_logger("note_helper")

def replace_content_markers(markdown: str, video_id: str, platform: str = 'bilibili') -> str:
    """
    替换 *Content-04:16*、Content-04:16 或 Content-[04:16] 为超链接，跳转到对应平台视频的时间位置
    """
    # 记录传入的video_id类型和值
    logger.info(f"replace_content_markers received video_id: {video_id}, type: {type(video_id)}, platform: {platform}")
    
    # 匹配三种形式：*Content-04:16*、Content-04:16、Content-[04:16]
    pattern = r"(?:\*?)Content-(?:\[(\d{2}):(\d{2})\]|(\d{2}):(\d{2}))"

    def replacer(match):
        mm = match.group(1) or match.group(3)
        ss = match.group(2) or match.group(4)
        total_seconds = int(mm) * 60 + int(ss)

        if platform == 'bilibili':
            # 处理B站视频ID可能包含分P信息的情况
            if isinstance(video_id, tuple) and len(video_id) == 2:
                bv_id, p_number = video_id
                logger.info(f"Using tuple video_id: bv_id={bv_id}, p_number={p_number}")
                url = f"https://www.bilibili.com/video/{bv_id}?p={p_number}&t={total_seconds}"
            else:
                logger.info(f"Using string video_id: {video_id}")
                url = f"https://www.bilibili.com/video/{video_id}?t={total_seconds}"
        elif platform == 'youtube':
            url = f"https://www.youtube.com/watch?v={video_id}&t={total_seconds}s"
        elif platform == 'douyin':
            url = f"https://www.douyin.com/video/{video_id}"
            return f"[原片 @ {mm}:{ss}]({url})"
        else:
            return f"({mm}:{ss})"

        logger.info(f"Generated URL: {url}")
        return f"[原片 @ {mm}:{ss}]({url})"

    return re.sub(pattern, replacer, markdown)
