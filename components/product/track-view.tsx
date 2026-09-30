"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/actions/recent";

// Cookies can only be written from a Server Function, so the view is recorded after render.
export function TrackView({ productId }: { productId: string }) {
  useEffect(() => {
    recordView(productId).catch(() => {});
  }, [productId]);
  return null;
}
