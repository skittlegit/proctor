# Sia prompt audio

These MP3s ship with the site. Playback uses HTML audio, not browser speech synthesis.

Voice: Microsoft `en-US-AriaNeural`, rate `-3%`, generated with edge-tts 7.2.8.
Generator: https://github.com/rany2/edge-tts

| File | Spoken text |
| --- | --- |
| introduction-v2.mp3 | Tell me a little about yourself and what drew you to front end engineering. |
| experience.mp3 | Tell me about a project where you improved a user experience. What was your role, and what changed? |
| walkthrough.mp3 | Walk me through your approach and one tradeoff you considered. |

Regenerate the corresponding clip whenever its question text changes. No synthesis service or API key is required at runtime.

The introduction uses the spoken spelling "front end" for pronunciation. Its versioned filename prevents reuse of the previous cached recording.
