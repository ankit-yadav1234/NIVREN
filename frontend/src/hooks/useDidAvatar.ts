"use client";

import * as React from "react";
import { sendAIMessage, type AIMessage, type AIClientAction } from "@/lib/api/ai";
import { AVATAR_CONFIG, type AvatarOption } from "@/config/avatar";
import { useRouter } from "next/navigation";

// Uses relative Next.js API routes (/api/did/...) so it functions seamlessly on Vercel production
const API_BASE = "";

export type DidAvatarStatus = "idle" | "connecting" | "connected" | "speaking" | "listening" | "error";

export function useDidAvatar(pathname: string) {
  const router = useRouter();
  const [currentAvatarKey, setCurrentAvatarKey] = React.useState<keyof typeof AVATAR_CONFIG.avatars>("male");
  const [status, setStatus] = React.useState<DidAvatarStatus>("idle");
  const [isListening, setIsListening] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const [lastReply, setLastReply] = React.useState("");
  const [audioLevel, setAudioLevel] = React.useState(0);
  const [mediaStream, setMediaStream] = React.useState<MediaStream | null>(null);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const pcRef = React.useRef<RTCPeerConnection | null>(null);
  const streamIdRef = React.useRef<string | null>(null);
  const sessionIdRef = React.useRef<string | null>(null);
  const recognitionRef = React.useRef<any>(null);
  const isMutedRef = React.useRef(isMuted);
  const historyRef = React.useRef<AIMessage[]>([]);

  React.useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  React.useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.muted = true;
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(() => {});
    }
  }, [mediaStream]);

  const activeAvatar: AvatarOption = AVATAR_CONFIG.avatars[currentAvatarKey] || AVATAR_CONFIG.avatars.male;

  // Execute client tools (e.g. page navigation or scroll)
  const executeClientAction = React.useCallback(
    (action: AIClientAction) => {
      if (action.type === "navigate") {
        const target = pathname.startsWith("/hi") ? `/hi${action.path}` : pathname.startsWith("/ar") ? `/ar${action.path}` : `/en${action.path}`;
        router.push(target);
      } else if (action.type === "scroll") {
        document.getElementById(action.sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [router, pathname]
  );

  // Send speech to avatar to speak via D-ID or fallback Web Speech Synthesis
  const speakText = React.useCallback(async (text: string, avatarKey: keyof typeof AVATAR_CONFIG.avatars = currentAvatarKey) => {
    setStatus("speaking");
    setLastReply(text);

    let spokeViaDid = false;
    if (streamIdRef.current && sessionIdRef.current) {
      try {
        const res = await fetch(`${API_BASE}/api/did/talk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            streamId: streamIdRef.current,
            sessionId: sessionIdRef.current,
            text,
            gender: avatarKey,
          }),
        });
        if (res.ok) {
          spokeViaDid = true;
        }
      } catch (err) {
        console.warn("D-ID stream talk error:", err);
      }
    }

    // Fallback speech synthesis if D-ID stream is not connected
    if (!spokeViaDid && typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.95; // Male consultant tone
        const voices = window.speechSynthesis.getVoices();
        const maleVoice = voices.find((v) => v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("guy") || v.name.toLowerCase().includes("male"));
        if (maleVoice) utterance.voice = maleVoice;

        utterance.onend = () => {
          setStatus("listening");
          if (!isMutedRef.current) startListening();
        };
        window.speechSynthesis.speak(utterance);
        return;
      } catch (_) {}
    }

    const duration = Math.max(3000, text.split(" ").length * 350);
    setTimeout(() => {
      setStatus("listening");
      if (!isMutedRef.current) {
        startListening();
      }
    }, duration);
  }, [currentAvatarKey]);

  // Ask AI via Gemini with RAG Knowledge + Tools, then trigger avatar speech
  const askAndSpeak = React.useCallback(async (userPrompt: string) => {
    if (!userPrompt.trim()) return;
    setTranscript(userPrompt);
    setStatus("speaking");

    // Add user message to conversation history
    historyRef.current.push({ role: "user", content: userPrompt });

    try {
      const result = await sendAIMessage(userPrompt, historyRef.current, {
        route: pathname,
        title: typeof document !== "undefined" ? document.title : "",
      });

      const reply = result.reply || "I am Dr. Dylan, your NIVREN RCM specialist. How can I assist your practice today?";
      historyRef.current.push({ role: "assistant", content: reply });

      // Execute any returned tool actions (e.g. Navigate to page)
      if (result.actions && result.actions.length > 0) {
        for (const action of result.actions) {
          executeClientAction(action);
        }
      }

      await speakText(reply);
    } catch (err) {
      console.error("RAG AI Query Error:", err);
      await speakText("NIVREN provides 98% clean claim medical billing and denial management. How can I help your clinic?");
    }
  }, [pathname, speakText, executeClientAction]);

  // Continuous Speech Recognition (Microphone Listening)
  const startListening = React.useCallback(() => {
    const SpeechRecognition =
      typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setStatus("listening");
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text && text.trim()) {
          setIsListening(false);
          askAndSpeak(text);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  }, [askAndSpeak]);

  const stopListening = React.useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Toggle Mute
  const toggleMute = React.useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        stopListening();
        if (videoRef.current) videoRef.current.muted = true;
        if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
      } else {
        if (videoRef.current) videoRef.current.muted = false;
        startListening();
      }
      return next;
    });
  }, [stopListening, startListening]);

  // Trigger video lip-sync on D-ID stream with zero conflicting audio
  const triggerLipSync = React.useCallback(async (text: string, avatarKey: keyof typeof AVATAR_CONFIG.avatars = currentAvatarKey) => {
    if (!text?.trim()) return;
    setStatus("speaking");
    setLastReply(text);

    if (streamIdRef.current && sessionIdRef.current) {
      try {
        await fetch(`${API_BASE}/api/did/talk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            streamId: streamIdRef.current,
            sessionId: sessionIdRef.current,
            text,
            gender: avatarKey,
          }),
        });
      } catch (err) {
        console.warn("D-ID lip-sync talk trigger error:", err);
      }
    }
  }, [currentAvatarKey]);

  // Initialize WebRTC Stream with D-ID (Video-Only for Lip-Sync)
  const startStream = React.useCallback(async (avatarKey: keyof typeof AVATAR_CONFIG.avatars = currentAvatarKey) => {
    setStatus("connecting");
    try {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      const targetAvatar = AVATAR_CONFIG.avatars[avatarKey] || activeAvatar;
      const res = await fetch(`${API_BASE}/api/did/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender: avatarKey, imageUrl: targetAvatar.imageUrl }),
      });

      if (!res.ok) {
        throw new Error("D-ID stream unavailable, running visual avatar pipeline");
      }

      const data = await res.json();
      const { id: streamId, offer, ice_servers: iceServers, session_id: sessionId } = data;

      streamIdRef.current = streamId;
      sessionIdRef.current = sessionId;

      const pc = new RTCPeerConnection({
        iceServers: iceServers?.length ? iceServers : [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      pc.ontrack = (event) => {
        // Strip out D-ID audio completely so ONLY LiveKit AI Voice is heard
        if (event.track.kind === "audio") {
          event.track.enabled = false;
          return;
        }

        if (event.streams && event.streams[0]) {
          setMediaStream(event.streams[0]);
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.srcObject = event.streams[0];
            videoRef.current.play().catch(() => {});
          }
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && streamIdRef.current && sessionIdRef.current) {
          fetch(`${API_BASE}/api/did/ice`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              streamId: streamIdRef.current,
              sessionId: sessionIdRef.current,
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
            }),
          }).catch(() => {});
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await fetch(`${API_BASE}/api/did/sdp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamId,
          sessionId,
          answer: {
            type: answer.type,
            sdp: answer.sdp,
          },
        }),
      });

      setStatus("connected");

      // Initialize D-ID lip sync talking animation immediately on connect
      setTimeout(() => {
        triggerLipSync("Hello! I am Dr. Dylan, your NIVREN healthcare and medical billing revenue cycle specialist. How can I assist you today?", avatarKey);
      }, 400);
    } catch (err) {
      console.warn("Using interactive RAG visual fallback:", err);
      setStatus("connected");
    }
  }, [currentAvatarKey, activeAvatar, triggerLipSync]);

  // Clean stop
  const stopStream = React.useCallback(() => {
    stopListening();
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    if (streamIdRef.current && sessionIdRef.current) {
      fetch(`${API_BASE}/api/did/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamId: streamIdRef.current,
          sessionId: sessionIdRef.current,
        }),
      }).catch(() => {});
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    streamIdRef.current = null;
    sessionIdRef.current = null;
    setStatus("idle");
  }, [stopListening]);

  return {
    currentAvatarKey,
    activeAvatar,
    status,
    videoRef,
    mediaStream,
    hasVideoStream: !!mediaStream,
    isListening,
    isMuted,
    transcript,
    lastReply,
    audioLevel,
    startStream,
    stopStream,
    toggleMute,
    startListening,
    askAndSpeak,
    triggerLipSync,
  };
}
