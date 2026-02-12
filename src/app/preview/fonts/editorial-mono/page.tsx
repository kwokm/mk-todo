import { FontPreviewShell } from "@/components/preview/FontPreviewShell";

export default function EditorialMonoPreview() {
  return (
    <FontPreviewShell
      styleName="Editorial Mono"
      fontFamily="var(--font-jetbrains)"
      description="Developer-focused, code-editor aesthetic. Tasks feel like a refined terminal checklist."
      taskClassName="font-[family-name:var(--font-jetbrains)] text-[13px] leading-8 text-emerald-100/80 tracking-[-0.02em]"
      completedClassName="font-[family-name:var(--font-jetbrains)] text-[13px] leading-8 text-emerald-100/25 line-through tracking-[-0.02em]"
      headerClassName="font-[family-name:var(--font-jetbrains)] text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400/60"
      metaClassName="font-[family-name:var(--font-jetbrains)] text-[10px] text-emerald-100/20"
    />
  );
}
