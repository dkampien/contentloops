# /// script
# requires-python = ">=3.11"
# dependencies = ["httpx", "anthropic"]
# ///
"""
Claude Code TTS Hook — gives Claude a voice using ElevenLabs.

Usage (called by Claude Code hooks, not directly):
    echo '<stdin_json>' | uv run tts_hook.py stop
    echo '<stdin_json>' | uv run tts_hook.py notify
    echo '<stdin_json>' | uv run tts_hook.py subagent-stop
"""

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import anthropic
import httpx

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent
CONFIG_PATH = SCRIPT_DIR / "tts-config.json"
DEBUG_LOG = SCRIPT_DIR / "tts-debug.log"


def debug(msg: str) -> None:
    """Write a debug message to the log file."""
    with open(DEBUG_LOG, "a") as f:
        f.write(f"{msg}\n")

PROMPT_SUMMARY = (
    "You are Claude, an AI coding assistant. You just finished responding to the user. "
    "Summarize what you just said or did in 1-2 short spoken sentences, in first person. "
    "Examples: 'I just updated the config file with your API key.' or "
    "'I found the bug — it was a missing null check in the auth handler.' "
    "Keep it casual, concise, and natural — this will be read aloud as your voice. "
    "Always generate a summary. Never refuse, never skip, never return empty."
)

PROMPT_CONVERSATION = (
    "Extract only the plain sentences from the following text. "
    "Remove any code blocks, markdown formatting, bullet points, tables, and file paths. "
    "Return the remaining sentences exactly as written, unchanged. "
    "Do not add, rephrase, comment, or respond. Output only the extracted sentences."
)

PROMPTS = {
    "summary": PROMPT_SUMMARY,
    "conversation": PROMPT_CONVERSATION,
}

MAX_TRANSCRIPT_CHARS = 3000  # Max chars of assistant response to send to summarizer


def load_config() -> dict:
    """Load configuration from tts-config.json."""
    if not CONFIG_PATH.exists():
        return {"enabled": False}
    with open(CONFIG_PATH) as f:
        return json.load(f)


def parse_stdin() -> dict:
    """Read and parse the JSON payload from stdin."""
    try:
        return json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        return {}


def extract_last_response(transcript_path: str) -> str:
    """Extract the last assistant response text from a JSONL transcript file."""
    path = Path(transcript_path)
    if not path.exists():
        return ""

    last_assistant = None
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            if entry.get("type") == "assistant":
                last_assistant = entry

    if not last_assistant:
        return ""

    # Extract text blocks from message.content
    message = last_assistant.get("message", {})
    content = message.get("content", [])

    # content can be a string or a list of blocks
    if isinstance(content, str):
        return content[:MAX_TRANSCRIPT_CHARS]

    text_parts = []
    for block in content:
        if isinstance(block, dict) and block.get("type") == "text":
            text_parts.append(block.get("text", ""))

    full_text = "\n".join(text_parts)
    return full_text[:MAX_TRANSCRIPT_CHARS]


def summarize(text: str, config: dict) -> str:
    """Use an LLM to generate spoken output from the response."""
    if not text.strip():
        return "SKIP"

    mode = config.get("mode", "summary")
    system_prompt = PROMPTS.get(mode, PROMPT_SUMMARY)

    summarizer = config.get("summarizer", {})
    provider = summarizer.get("provider", "anthropic")
    model = summarizer.get("model", "claude-haiku-4-5-20251001")

    if provider == "anthropic":
        api_key = summarizer.get("api_key", "") or os.environ.get("ANTHROPIC_API_KEY", "")
        if not api_key:
            return "Task complete, ready for next steps."

        try:
            client = anthropic.Anthropic(api_key=api_key)
            max_tokens = 150 if mode == "summary" else 1024
            response = client.messages.create(
                model=model,
                max_tokens=max_tokens,
                system=system_prompt,
                messages=[{"role": "user", "content": text}],
            )
            result = response.content[0].text.strip()
            return result
        except Exception as e:
            print(f"Summarizer error: {e}", file=sys.stderr)
            return "Task complete, ready for next steps."

    # Fallback for unknown providers
    return "Task complete, ready for next steps."


def speak(text: str, config: dict) -> None:
    """Generate speech with ElevenLabs and play it."""
    api_key = config.get("elevenlabs_api_key", "") or os.environ.get("ELEVENLABS_API_KEY", "")
    if not api_key:
        return

    voice_id = config.get("elevenlabs_voice_id", "JBFqnCBsd6RMkjVDRZzb")
    model_id = config.get("elevenlabs_model_id", "eleven_multilingual_v2")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
        },
    }

    try:
        response = httpx.post(url, json=payload, headers=headers, timeout=30.0)
        response.raise_for_status()
    except (httpx.HTTPError, httpx.TimeoutException):
        # Silent failure — don't break Claude Code
        return

    # Write audio to temp file and play
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp.write(response.content)
        tmp_path = tmp.name

    # Play audio in background, then clean up
    subprocess.Popen(
        ["bash", "-c", f'afplay "{tmp_path}" && rm -f "{tmp_path}"'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


# ---------------------------------------------------------------------------
# Hook handlers
# ---------------------------------------------------------------------------

def handle_stop(input_data: dict, config: dict) -> None:
    """Handle the Stop hook event."""
    debug(f"=== STOP HOOK FIRED ===")
    debug(f"input keys: {list(input_data.keys())}")
    debug(f"stop_hook_active: {input_data.get('stop_hook_active')}")

    # Prevent infinite loops
    if input_data.get("stop_hook_active"):
        debug("BAIL: stop_hook_active is true")
        return

    if not config.get("hooks", {}).get("stop", True):
        debug("BAIL: stop hook disabled in config")
        return

    mode = config.get("mode", "summary")

    # Notification mode: fixed phrase, no LLM, no transcript reading
    if mode == "notification":
        debug("notification mode: speaking fixed phrase")
        speak("I'm done, ready for the next step.", config)
        return

    # Summary and conversation modes: read transcript, call LLM
    transcript_path = input_data.get("transcript_path", "")
    debug(f"transcript_path: {transcript_path}")
    if not transcript_path:
        debug("BAIL: no transcript_path")
        return

    text = extract_last_response(transcript_path)
    debug(f"extracted text length: {len(text)}")
    if not text:
        debug("BAIL: no text extracted")
        return

    summary = summarize(text, config)
    debug(f"summary: {summary}")

    debug("calling speak()")
    speak(summary, config)


def handle_notify(input_data: dict, config: dict) -> None:
    """Handle the Notification hook event."""
    if not config.get("hooks", {}).get("notification", True):
        return

    # Per-type filtering
    notification_type = input_data.get("notification_type", "")
    notification_types = config.get("hooks", {}).get("notification_types", {})
    if notification_types and not notification_types.get(notification_type, True):
        debug(f"BAIL: notification type '{notification_type}' disabled")
        return

    message = input_data.get("message", "I need your input.")
    # Rewrite third person to first person so it sounds like Claude speaking
    message = message.replace("Claude needs", "I need")
    message = message.replace("Claude has", "I have")
    message = message.replace("Claude is", "I am")
    speak(message, config)


def handle_subagent_stop(input_data: dict, config: dict) -> None:
    """Handle the SubagentStop hook event."""
    if not config.get("hooks", {}).get("subagent_stop", True):
        return

    speak("A background task just finished.", config)


def handle_tool_failure(input_data: dict, config: dict) -> None:
    """Handle the PostToolUseFailure hook event."""
    if not config.get("hooks", {}).get("tool_failure", True):
        return

    tool_name = input_data.get("tool_name", "a tool")
    speak(f"I hit an error running {tool_name}.", config)


def handle_task_completed(input_data: dict, config: dict) -> None:
    """Handle the TaskCompleted hook event."""
    if not config.get("hooks", {}).get("task_completed", True):
        return

    speak("A task was just completed.", config)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: tts_hook.py <stop|notify|subagent-stop|tool-failure|task-completed>", file=sys.stderr)
        sys.exit(1)

    mode = sys.argv[1]
    config = load_config()

    if not config.get("enabled", False):
        return

    input_data = parse_stdin()

    handlers = {
        "stop": handle_stop,
        "tool-failure": handle_tool_failure,
        "task-completed": handle_task_completed,
        "notify": handle_notify,
        "subagent-stop": handle_subagent_stop,
    }

    handler = handlers.get(mode)
    if handler:
        handler(input_data, config)


if __name__ == "__main__":
    main()
