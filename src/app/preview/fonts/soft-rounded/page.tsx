import { FontPreviewShell } from "@/components/preview/FontPreviewShell";

export default function SoftRoundedPreview() {
  return (
    <FontPreviewShell
      styleName="Soft Rounded"
      fontFamily="var(--font-nunito)"
      description="Friendly, approachable, slightly larger text. Feels gentle and calm — good for personal/life tasks."
      taskClassName="font-[family-name:var(--font-nunito)] text-[15px] leading-9 text-white/85 tracking-[0.005em]"
      completedClassName="font-[family-name:var(--font-nunito)] text-[15px] leading-9 text-white/25 line-through tracking-[0.005em]"
      headerClassName="font-[family-name:var(--font-nunito)] text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-400/50"
      metaClassName="font-[family-name:var(--font-nunito)] text-xs text-sky-100/20"
    />
  );
}
