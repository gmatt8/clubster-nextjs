// apps/web-customer/components/basket/AuthModal.js
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import Link from "next/link";

export default function AuthModal({ open, onClose }) {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login required</DialogTitle>
          <DialogDescription>
          You must log in to complete your order.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-4">
          <Link 
            href={`/login?next=${encodeURIComponent(currentUrl)}`} 
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            LOGIN
          </Link>
          <Link 
            href={`/signup?next=${encodeURIComponent(currentUrl)}`} 
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            SIGNUP
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
