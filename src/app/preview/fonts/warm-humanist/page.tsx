import { FontPreviewShell } from "@/components/preview/FontPreviewShell";

export default function WarmHumanistPreview() {
  return (
    <FontPreviewShell
      styleName="Warm Humanist"
      fontFamily="var(--font-dm-sans)"
      description="Warm, approachable, modern humanist sans-serif. Soft and friendly without being childish."
      taskClassName="font-[family-name:var(--font-dm-sans)] text-[15px] leading-8 text-white/90 tracking-[-0.01em]"
      completedClassName="font-[family-name:var(--font-dm-sans)] text-[15px] leading-8 text-white/30 line-through tracking-[-0.01em]"
      headerClassName="font-[family-name:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.15em] text-[#9333ea]/70"
      metaClassName="font-[family-name:var(--font-dm-sans)] text-xs text-white/25"
    />
  );
}
