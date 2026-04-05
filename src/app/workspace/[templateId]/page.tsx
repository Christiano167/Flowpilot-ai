import { notFound } from "next/navigation";

import { WorkspaceShell } from "@/components/flowpilot/workspace-shell";
import { getTemplateById } from "@/lib/mocks/templates";

export function generateMetadata({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  return params.then(({ templateId }) => {
    const template = getTemplateById(templateId);

    if (!template) {
      return {
        title: "Template Not Found | FlowPilot AI",
      };
    }

    return {
      title: `${template.name} | FlowPilot AI`,
      description: template.summary,
    };
  });
}

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const template = getTemplateById(templateId);

  if (!template) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8 md:py-8">
      <WorkspaceShell template={template} />
    </div>
  );
}
