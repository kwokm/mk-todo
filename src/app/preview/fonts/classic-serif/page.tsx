import { FontPreviewShell } from "@/components/preview/FontPreviewShell";

export default function ClassicSerifPreview() {
  return (
    <FontPreviewShell
      styleName="Classic Serif"
      fontFamily="var(--font-lora)"
      description="Analog notebook / journal feel. Elegant and literary, like writing in a Moleskine."
      taskClassName="font-[family-name:var(--font-lora)] text-[15px] leading-8 text-amber-50/85 tracking-[0.01em]"
      completedClassName="font-[family-name:var(--font-lora)] text-[15px] leading-8 text-amber-50/25 line-through tracking-[0.01em] italic"
      headerClassName="font-[family-name:var(--font-lora)] text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/40"
      metaClassName="font-[family-name:var(--font-lora)] text-[11px] text-amber-100/20 italic"
    />
  );
}
