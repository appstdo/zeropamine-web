"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ContactCategory, ContactRequest, ContactResponse } from "@/types/contact";
import { CONTACT_CATEGORIES } from "@/types/contact";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  const t = useTranslations("contact");

  const [category, setCategory] = useState<ContactCategory | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setCategory(null);
      setEmail("");
      setMessage("");
      setStatus("idle");
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!category || !message.trim()) return;

    setStatus("sending");

    try {
      const payload: ContactRequest = {
        category,
        email: email.trim() || undefined,
        message: message.trim(),
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: ContactResponse = await response.json();

      if (data.success) {
        setStatus("success");
        setTimeout(() => {
          handleOpenChange(false);
        }, 2000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const isSubmitDisabled = !category || !message.trim() || status === "sending";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-md bg-gray-800 text-white border-gray-700 max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-3 sm:py-4 overflow-y-auto pr-1">
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("category.label")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CONTACT_CATEGORIES.map((cat) => {
                const isActive = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "border-white/60 bg-white/20 text-white"
                        : "border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:text-white"
                    }`}
                    aria-pressed={isActive}
                  >
                    {t(`category.${cat}`)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="contact-email" className="text-sm font-medium">
              {t("email.label")}
            </label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("email.placeholder")}
              className="bg-gray-900 border-gray-700 text-white h-10 sm:h-11 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contact-message" className="text-sm font-medium">
              {t("message.label")}
            </label>
            <Textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("message.placeholder")}
              rows={4}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 resize-none"
            />
          </div>

          {status === "success" && (
            <p className="text-sm text-green-400 text-center">
              {t("status.success")}
            </p>
          )}

          {status === "error" && (
            <p className="text-sm text-red-400 text-center">
              {t("status.error")}
            </p>
          )}
        </div>

        <div className="flex gap-2 sm:gap-3 pt-2">
          <Button
            onClick={() => handleOpenChange(false)}
            variant="outline"
            className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm sm:text-base h-10 sm:h-11"
          >
            {t("actions.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white text-sm sm:text-base h-10 sm:h-11 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "sending" ? t("status.sending") : t("actions.submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
