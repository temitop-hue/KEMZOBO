import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { X, Mail } from "lucide-react";

const STORAGE_KEY = "kz_newsletter_popup";
const SHOW_AFTER_MS = 25_000; // 25 seconds on the site
const COOLDOWN_DAYS = 30;

function dismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (Number.isNaN(ts)) return false;
    return Date.now() - ts < COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return true; // if storage is broken, default to not annoying the user
  }
}

function markDismissed() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* ignore — cookie-blocked browsers */
  }
}

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const subscribe = trpc.subscribe.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      markDismissed();
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (dismissedRecently()) return;

    // Trigger after time-on-site delay OR exit-intent — whichever comes first
    let timer: ReturnType<typeof setTimeout> | null = null;
    let opened = false;

    const open = () => {
      if (opened) return;
      opened = true;
      setOpen(true);
    };

    timer = setTimeout(open, SHOW_AFTER_MS);

    const onMouseLeave = (e: MouseEvent) => {
      // Cursor leaves through the top edge — classic exit-intent signal
      if (e.clientY <= 0) open();
    };
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  if (!open) return null;

  const handleClose = () => {
    setOpen(false);
    markDismissed();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribe.mutate({ email: email.trim() });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 text-muted-foreground hover:text-foreground p-1"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-[#CC2936]/10 mx-auto mb-4 flex items-center justify-center">
              <Mail className="h-6 w-6 text-[#CC2936]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">You're in.</h2>
            <p className="text-muted-foreground mb-6">
              Welcome to the KEMZOBO circle. Watch your inbox for our next drop.
            </p>
            <button
              onClick={handleClose}
              className="rounded-full bg-[#CC2936] text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors"
            >
              Keep browsing
            </button>
          </div>
        ) : (
          <>
            <div className="aspect-[2/1] bg-[#0f0806] relative overflow-hidden">
              <img
                src="/images/Hero%20picture.jpeg"
                alt="KEMZOBO"
                className="w-full h-full object-cover object-[60%_30%]"
                style={{ filter: "saturate(1.05)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <p className="text-white/80 text-xs uppercase tracking-[0.3em] font-bold">Exclusive offer</p>
                <h2 className="font-display text-2xl font-bold text-white mt-1">Get 10% off your first order.</h2>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Drop your email and we'll send a one-time code, plus the occasional update on
                new flavors and where KEMZOBO is showing up next.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-full border border-[#CC2936]/20 bg-hibiscus-bg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936] focus:bg-white transition-colors"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={subscribe.isPending}
                  className="rounded-full bg-[#CC2936] text-white px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors disabled:opacity-50"
                >
                  {subscribe.isPending ? "..." : "Get 10%"}
                </button>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="block mx-auto mt-4 text-xs text-muted-foreground hover:text-foreground"
              >
                No thanks, I'll pay full price
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
