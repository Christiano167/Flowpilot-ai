import type { WorkflowTemplate } from "@/lib/types";

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "support-escalation",
    name: "Support Escalation Flow",
    audience: "Support operations",
    summary:
      "Turn raw support context into a triage-ready escalation brief with trust cues and revision control.",
    description:
      "Built for teams handling urgent tickets that need fast context packaging, response drafting, and quality review.",
    accent: "Petrol",
    tags: ["triage", "sla", "handoff"],
    estimatedMinutes: 12,
    steps: [
      {
        id: "intake",
        title: "Issue Intake",
        summary:
          "Frame the raw ticket signal before the assistant proposes any action.",
        purpose:
          "Collect the case summary, desired tone, and critical customer context.",
        outputLabel: "Intake brief",
        estimatedMinutes: 3,
        fields: [
          {
            id: "ticketSummary",
            label: "Ticket summary",
            kind: "textarea",
            placeholder: "Summarize the customer issue and why it matters now.",
            description: "This becomes the primary situation snapshot.",
            rows: 6,
            defaultValue:
              "Customer cannot complete payout verification after a policy update and is threatening churn within the next 24 hours.",
          },
          {
            id: "customerContext",
            label: "Customer context",
            kind: "textarea",
            placeholder: "List account history, contract tier, recent incidents, or risk level.",
            description: "Use factual context only.",
            rows: 4,
            defaultValue:
              "Enterprise plan, 4 regions active, prior SLA breach last month, renewal review scheduled next week.",
          },
          {
            id: "tone",
            label: "Response tone",
            kind: "input",
            placeholder: "Calm, direct, reassuring, etc.",
            description: "Controls the tone of the draft.",
            defaultValue: "Calm, specific, and accountable",
          },
        ],
        variables: [
          {
            id: "slaTarget",
            token: "{{sla_target}}",
            label: "SLA target",
            sample: "2 hours",
          },
          {
            id: "riskLevel",
            token: "{{risk_level}}",
            label: "Risk level",
            sample: "High churn risk",
          },
        ],
        seededOutput: [
          "Summarize the customer risk in one sentence before proposing action.",
          "Separate confirmed facts from assumptions.",
          "Highlight what the next responder must know in under 15 seconds.",
        ],
      },
      {
        id: "response-draft",
        title: "Response Draft",
        summary: "Generate a draft reply with visible guardrails and escalation notes.",
        purpose:
          "Turn the intake into a response that can be edited, retried, or compared against previous revisions.",
        outputLabel: "Draft response",
        estimatedMinutes: 4,
        fields: [
          {
            id: "goal",
            label: "Primary outcome",
            kind: "input",
            placeholder: "What should this draft accomplish?",
            description: "Keep it measurable and immediate.",
            defaultValue: "De-escalate the account and secure a 24-hour recovery window.",
          },
          {
            id: "guardrails",
            label: "Guardrails",
            kind: "textarea",
            placeholder: "List anything the response must avoid or clarify.",
            description: "Useful for testing trust-focused AI UX.",
            rows: 5,
            defaultValue:
              "Do not promise an immediate resolution, avoid legal language, and call out that engineering validation is still in progress.",
          },
        ],
        variables: [
          {
            id: "owner",
            token: "{{response_owner}}",
            label: "Response owner",
            sample: "Tier 2 Support Lead",
          },
          {
            id: "deadline",
            token: "{{next_update_deadline}}",
            label: "Next update deadline",
            sample: "Today, 17:30 UTC",
          },
        ],
        seededOutput: [
          "Lead with ownership before explanation.",
          "Use numbered next steps so the customer can scan quickly.",
          "End with a precise follow-up promise and named owner.",
        ],
      },
      {
        id: "qa-check",
        title: "QA Review",
        summary:
          "Run a final pass for missing risks, unclear phrasing, and escalation readiness.",
        purpose:
          "Package the final handoff notes so teams can compare revisions confidently.",
        outputLabel: "QA notes",
        estimatedMinutes: 5,
        fields: [
          {
            id: "qualityBar",
            label: "Quality bar",
            kind: "textarea",
            placeholder: "What must be true before this message ships?",
            description: "Use this to bias the QA output.",
            rows: 4,
            defaultValue:
              "The note must mention timeline, ownership, current limitation, and next checkpoint without sounding robotic.",
          },
          {
            id: "reviewLens",
            label: "Review lens",
            kind: "input",
            placeholder: "Choose the QA perspective.",
            description: "Examples: compliance, empathy, escalation readiness.",
            defaultValue: "Escalation readiness",
          },
        ],
        variables: [
          {
            id: "approver",
            token: "{{approver_name}}",
            label: "Approver",
            sample: "Maya Chen",
          },
        ],
        seededOutput: [
          "Call out any promise that lacks internal confirmation.",
          "Score the message on clarity, empathy, and actionability.",
          "Finish with a short ship / revise recommendation.",
        ],
      },
    ],
  },
  {
    id: "campaign-brief",
    name: "Campaign Brief Builder",
    audience: "Content strategy",
    summary:
      "Transform scattered launch notes into a tight creative brief, channel plan, and revision archive.",
    description:
      "A repeatable flow for content teams who need fast campaign structuring without losing narrative control.",
    accent: "Coral",
    tags: ["content", "launch", "editorial"],
    estimatedMinutes: 10,
    steps: [
      {
        id: "positioning",
        title: "Positioning Pass",
        summary: "Capture product angle, target audience, and launch timing.",
        purpose: "Frame the brief before drafting deliverables.",
        outputLabel: "Positioning note",
        estimatedMinutes: 3,
        fields: [
          {
            id: "productShift",
            label: "What changed?",
            kind: "textarea",
            placeholder: "Describe the new product or release in one paragraph.",
            description: "This is the launch anchor.",
            rows: 5,
            defaultValue:
              "FlowPilot now supports revision comparison and partial-run cancellation for AI workflow teams.",
          },
          {
            id: "targetAudience",
            label: "Target audience",
            kind: "input",
            placeholder: "Who is this for?",
            description: "Keep the target persona specific.",
            defaultValue: "Ops-focused SaaS teams shipping AI-assisted support workflows.",
          },
        ],
        variables: [
          {
            id: "launchDate",
            token: "{{launch_date}}",
            label: "Launch date",
            sample: "May 14",
          },
        ],
        seededOutput: [
          "Compress the launch angle into a one-line positioning statement.",
          "List the main audience objection in plain language.",
        ],
      },
      {
        id: "channel-plan",
        title: "Channel Plan",
        summary: "Map the core message into specific channel requirements.",
        purpose: "Generate channel-specific framing with shared tone.",
        outputLabel: "Channel plan",
        estimatedMinutes: 3,
        fields: [
          {
            id: "channels",
            label: "Priority channels",
            kind: "textarea",
            placeholder: "List the channels and any specific constraints.",
            description: "One channel per line works best.",
            rows: 4,
            defaultValue:
              "Product announcement email\nLinkedIn launch post\nLifecycle in-app banner",
          },
          {
            id: "cta",
            label: "Primary CTA",
            kind: "input",
            placeholder: "What should the audience do next?",
            description: "Used as a repeated thread across output.",
            defaultValue: "Book a walkthrough with the ops team.",
          },
        ],
        variables: [
          {
            id: "campaignName",
            token: "{{campaign_name}}",
            label: "Campaign name",
            sample: "Launch Week / Signal Control",
          },
        ],
        seededOutput: [
          "Keep message architecture consistent across channels.",
          "Note what to trim for short-form surfaces.",
        ],
      },
      {
        id: "review",
        title: "Editorial Review",
        summary: "Audit the brief for clarity, consistency, and campaign readiness.",
        purpose: "Provide a revision-ready review summary.",
        outputLabel: "Editorial review",
        estimatedMinutes: 4,
        fields: [
          {
            id: "reviewFocus",
            label: "Review focus",
            kind: "input",
            placeholder: "What matters most in this review?",
            description: "Choose the strongest risk axis.",
            defaultValue: "Clarity and consistency across channels",
          },
        ],
        variables: [
          {
            id: "reviewOwner",
            token: "{{review_owner}}",
            label: "Review owner",
            sample: "Senior Content Strategist",
          },
        ],
        seededOutput: [
          "Call out repetition that weakens the campaign story.",
          "Recommend one concrete revision before launch.",
        ],
      },
    ],
  },
  {
    id: "postmortem-synthesis",
    name: "Incident Postmortem Synthesis",
    audience: "Product and engineering",
    summary:
      "Organize incident context, root-cause framing, and follow-up actions into a cleaner postmortem narrative.",
    description:
      "Useful for teams that need a repeatable AI-assisted structure for incident reviews without losing ownership or specificity.",
    accent: "Sand",
    tags: ["incident", "retrospective", "ops"],
    estimatedMinutes: 14,
    steps: [
      {
        id: "timeline",
        title: "Timeline Draft",
        summary: "Structure the event chronology before assigning blame or fixes.",
        purpose: "Create a readable and precise incident timeline.",
        outputLabel: "Timeline",
        estimatedMinutes: 4,
        fields: [
          {
            id: "incidentSummary",
            label: "Incident summary",
            kind: "textarea",
            placeholder: "Explain what happened and who was affected.",
            description: "Keep the first sentence concrete.",
            rows: 5,
            defaultValue:
              "A release introduced a queue regression that delayed outbound notifications for 42 minutes across EU tenants.",
          },
          {
            id: "affectedScope",
            label: "Affected scope",
            kind: "input",
            placeholder: "Who or what was affected?",
            description: "Used in the final timeline summary.",
            defaultValue: "EU production tenants only",
          },
        ],
        variables: [
          {
            id: "timezone",
            token: "{{timezone}}",
            label: "Timeline timezone",
            sample: "UTC",
          },
        ],
        seededOutput: [
          "Use bullet timestamps, not prose paragraphs.",
          "Separate detection, mitigation, and recovery moments.",
        ],
      },
      {
        id: "root-cause",
        title: "Root Cause Narrative",
        summary: "Translate technical cause into a cross-functional explanation.",
        purpose: "Produce a balanced root-cause narrative that stays readable.",
        outputLabel: "Root cause",
        estimatedMinutes: 5,
        fields: [
          {
            id: "technicalCause",
            label: "Technical cause",
            kind: "textarea",
            placeholder: "Describe the actual cause as clearly as possible.",
            description: "This is the main technical input.",
            rows: 5,
            defaultValue:
              "A retry worker was redeployed without the updated backoff configuration, causing queued jobs to stall under peak load.",
          },
          {
            id: "systemsLens",
            label: "Systems lens",
            kind: "input",
            placeholder: "Choose the explanatory frame.",
            description: "Examples: process gap, testing gap, ownership ambiguity.",
            defaultValue: "Testing gap with incomplete rollout checks",
          },
        ],
        variables: [
          {
            id: "incidentOwner",
            token: "{{incident_owner}}",
            label: "Incident owner",
            sample: "Platform Reliability",
          },
        ],
        seededOutput: [
          "Avoid blame-heavy language.",
          "Explain why the system allowed the issue to ship.",
        ],
      },
      {
        id: "follow-up",
        title: "Follow-up Actions",
        summary: "Turn the narrative into crisp, accountable next steps.",
        purpose: "Provide a final action list with clear ownership.",
        outputLabel: "Follow-up actions",
        estimatedMinutes: 5,
        fields: [
          {
            id: "actionBar",
            label: "Action quality bar",
            kind: "textarea",
            placeholder: "Describe how specific or measurable the actions should be.",
            description: "Helps shape the action list.",
            rows: 4,
            defaultValue:
              "Every action must have an owner, due date frame, and expected risk reduction outcome.",
          },
        ],
        variables: [
          {
            id: "reviewCadence",
            token: "{{review_cadence}}",
            label: "Review cadence",
            sample: "Weekly ops review",
          },
        ],
        seededOutput: [
          "Limit to the most important actions.",
          "Call out what should be verified in the next review cycle.",
        ],
      },
    ],
  },
];

export function getTemplateById(templateId: string) {
  return workflowTemplates.find((template) => template.id === templateId) ?? null;
}
