import { FontPreviewShell } from "@/components/preview/FontPreviewShell";

export default function GeometricCleanPreview() {
  return (
    <FontPreviewShell
      styleName="Geometric Clean"
      fontFamily="var(--font-jakarta)"
      description="Modern SaaS / product design aesthetic. Clean, geometric, professional."
      taskClassName="font-[family-name:var(--font-jakarta)] text-sm leading-8 text-white/95 font-medium tracking-[-0.02em]"
      completedClassName="font-[family-name:var(--font-jakarta)] text-sm leading-8 text-white/25 font-normal line-through tracking-[-0.02em]"
      headerClassName="font-[family-name:var(--font-jakarta)] text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-400/60"
      metaClassName="font-[family-name:var(--font-jakarta)] text-[11px] text-white/20 font-medium"
    />
  );
}
