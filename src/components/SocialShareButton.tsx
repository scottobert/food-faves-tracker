
import React, { useState } from "react";
import { Share, Facebook, Twitter, Instagram } from "lucide-react";

type SocialOption = "share" | "facebook" | "twitter" | "instagram" | "copy";

type Props = {
  url: string; // URL to share
  text: string; // Sharing message
  imageUrl?: string;
  className?: string;
};

function getShareUrl(option: SocialOption, url: string, text: string) {
  switch (option) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`;
    case "instagram":
      // Instagram does not support direct web sharing. We can only copy or open their website.
      return `https://www.instagram.com/`;
    default:
      return url;
  }
}

export default function SocialShareButton({ url, text, imageUrl, className }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const doWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: text,
          text,
          url,
        });
        setOpen(false);
      } catch {
        // silent
      }
    }
  };

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      setOpen(false);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className={"relative " + (className || "")}>
      <button
        className="p-2 rounded-full bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={e => {
          e.stopPropagation();
          setOpen(v => !v);
        }}
        title="Share meal"
        aria-label="Share meal"
        type="button"
      >
        <Share size={16} className="text-gray-600 hover:text-blue-600" />
      </button>
      {open && (
        <div className="absolute right-0 bottom-12 z-20 bg-white border rounded shadow-lg w-44 p-2 animate-fade-in"
             onClick={e => e.stopPropagation()}>
          <button
            className="flex items-center gap-2 w-full hover:bg-slate-100 px-2 py-1 rounded transition"
            onClick={doWebShare}
            type="button"
          >
            <Share size={16} /> Share...
          </button>
          <a
            href={getShareUrl("facebook", url, text)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full hover:bg-slate-100 px-2 py-1 rounded transition"
          >
            <Facebook size={16} className="text-blue-700" /> Facebook
          </a>
          <a
            href={getShareUrl("twitter", url, text)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full hover:bg-slate-100 px-2 py-1 rounded transition"
          >
            <Twitter size={16} className="text-sky-500" /> Twitter/X
          </a>
          <a
            href={getShareUrl("instagram", url, text)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full hover:bg-slate-100 px-2 py-1 rounded transition"
          >
            <Instagram size={16} className="text-pink-600" /> Instagram
          </a>
          <button
            className="flex items-center gap-2 w-full hover:bg-slate-100 px-2 py-1 rounded transition"
            onClick={doCopy}
            type="button"
          >
            <Share size={16} /> {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      )}
    </div>
  );
}
