# Sia prompt audio

These MP3s ship with the site. Playback uses HTML audio, not browser speech synthesis.

Voice: Microsoft `en-US-AriaNeural`, rate `-3%`, generated with edge-tts 7.2.8.
Generator: https://github.com/rany2/edge-tts

| File | Spoken text |
| --- | --- |
| introduction-v2.mp3 | Tell me a little about yourself and what drew you to front end engineering. |
| experience.mp3 | Tell me about a project where you improved a user experience. What was your role, and what changed? |
| walkthrough.mp3 | Walk me through your approach and one tradeoff you considered. |
| coding-instructions.mp3 | Next is your coding assessment. Read the problem, examples, and constraints, then choose your programming language and write your solution in the editor. Your code draft is saved automatically in this browser. Keep your camera and microphone connected while you work. Review your solution before selecting Submit solution. After submission, your code becomes read only, and I will ask you to explain your approach, its complexity, and one tradeoff you considered. Select Start coding when you are ready. |
| coding-instructions-v2.mp3 | Now, let's move on to the coding exercise. You'll work on one challenge, then talk me through your solution. Start by reading the problem, examples, and constraints. Choose the language you're most comfortable with, and build your solution in the editor. Your draft is saved in this browser as you work. Before you submit, check your reasoning against the examples and consider edge cases. Once you select Submit solution, your code will be read only. I'll then ask you to explain your approach and one tradeoff you made. Keep your camera and microphone connected. When you're ready, select Start coding. |

Regenerate the corresponding clip whenever its question text changes. No synthesis service or API key is required at runtime.

The introduction uses the spoken spelling "front end" for pronunciation. Its versioned filename prevents reuse of the previous cached recording.

The coding briefing uses `coding-instructions-v2.mp3`; its full transcript is shown in `components/interview/coding-briefing.tsx`. The original coding recording is retained for older cached clients.
