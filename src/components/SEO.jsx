import { useEffect } from "react";

export default function SEO({ title, description }) {
  useEffect(() => {
    document.title = title ? `${title} | HamTed` : "HamTed — Hammadde Tedarik Platformu";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", description || "Turkiye'nin B2B hammadde tedarik platformu. Celik, cimento, kimyasal, tekstil ve daha fazlasi.");
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = description || "Turkiye'nin B2B hammadde tedarik platformu.";
      document.head.appendChild(newMeta);
    }
  }, [title, description]);
  return null;
}
