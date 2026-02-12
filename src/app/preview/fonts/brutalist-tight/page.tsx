import { FontPreviewShell } from "@/components/preview/FontPreviewShell";

export default function BrutalistTightPreview() {
  return (
    <FontPreviewShell
      styleName="Brutalist Tight"
      fontFamily="var(--font-space-grotesk)"
      description="Bold, dense, high-contrast. Brutalist design — no decoration, maximum information density."
      taskClassName="font-[family-name:var(--font-space-grotesk)] text-[13px] leading-7 text-white font-medium tracking-[-0.03em]"
      completedClassName="font-[family-name:var(--font-space-grotesk)] text-[13px] leading-7 text-white/20 font-normal line-through tracking-[-0.03em]"
      headerClassName="font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase tracking-[0.08em] text-red-500/70"
      metaClassName="font-[family-name:var(--font-space-grotesk)] text-[10px] text-white/15 font-medium"
    />
  );
}
