"use client";

import { useEffect, useMemo, useState } from "react";

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "avif"] as const;

interface UserAvatarProps {
  username?: string | null;
  fullName?: string | null;
  size?: number;
  className?: string;
  fallbackClassName?: string;
  alt?: string;
}

function buildImageCandidates(username: string): string[] {
  const trimmed = username.trim();
  if (!trimmed) {
    return [];
  }

  const variants = [trimmed, trimmed.toLowerCase()];
  const uniqueVariants = Array.from(new Set(variants));

  return uniqueVariants.flatMap((name) =>
    IMAGE_EXTENSIONS.map((ext) => `/${name}.${ext}`)
  );
}

function getInitials(fullName?: string | null, username?: string | null): string {
  const normalizedName = (fullName || "").trim();
  if (normalizedName) {
    const initials = normalizedName
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase();

    if (initials) {
      return initials;
    }
  }

  const normalizedUsername = (username || "").trim();
  if (!normalizedUsername) {
    return "?";
  }

  return normalizedUsername
    .split(/[._-]+/)
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase() || normalizedUsername.slice(0, 2).toUpperCase();
}

function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  const hue = hash % 360;
  return `hsl(${hue} 55% 45%)`;
}

export default function UserAvatar({
  username,
  fullName,
  size = 40,
  className = "",
  fallbackClassName = "",
  alt,
}: UserAvatarProps) {
  const normalizedUsername = (username || "").trim();
  const imageCandidates = useMemo(
    () => buildImageCandidates(normalizedUsername),
    [normalizedUsername]
  );

  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [normalizedUsername]);

  const hasImageCandidate = imageCandidates.length > 0 && candidateIndex < imageCandidates.length;
  const fallbackSeed = normalizedUsername || (fullName || "user").trim().toLowerCase() || "user";
  const initials = getInitials(fullName, normalizedUsername);

  return (
    <div
      className={`rounded-full overflow-hidden shrink-0 ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-label={alt || `${fullName || normalizedUsername || "User"} avatar`}
      title={fullName || normalizedUsername || "User"}
    >
      {hasImageCandidate ? (
        <img
          src={imageCandidates[candidateIndex]}
          alt={alt || `${fullName || normalizedUsername || "User"} avatar`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => {
            setCandidateIndex((prev) => prev + 1);
          }}
        />
      ) : (
        <div
          className={`h-full w-full flex items-center justify-center text-white font-bold uppercase ${fallbackClassName}`.trim()}
          style={{ backgroundColor: getAvatarColor(fallbackSeed) }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
