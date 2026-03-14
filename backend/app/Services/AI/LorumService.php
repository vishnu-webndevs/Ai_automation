<?php

namespace App\Services\AI;

class LorumService implements AIServiceInterface
{
    public function generatePageContent(array $context): array
    {
        if (isset($context['prompt_override']) && is_string($context['prompt_override']) && trim($context['prompt_override']) !== '') {
            $schema = (string)($context['output_schema'] ?? 'page');
            if ($schema === 'service') {
                $serviceName = (string)($context['service_name'] ?? ($context['primary_keyword'] ?? 'Service'));
                $industry = (string)($context['target_industry'] ?? 'General');

                return [
                    'service_name' => '{service_name}',
                    'meta_title' => "{$serviceName} for {$industry} | Totan.ai",
                    'meta_description' => "SEO-focused {$serviceName} for {$industry}. Automate workflows and improve efficiency with Totan.ai.",
                    'hero' => [
                        'headline' => '{service_name} for {industry}',
                        'subheadline' => "Automate {automation_type} to reduce delays and improve operational efficiency.",
                        'short_description' => "Totan.ai delivers {service_name} for {industry} teams to improve speed, quality, and scalability.",
                        'trust_text' => 'Trusted by international teams. Built for measurable outcomes.',
                        'primary_cta_label' => 'Book a Free Consultation',
                        'secondary_cta_label' => 'See Use Cases',
                    ],
                    'intro' => [
                        'body' => "{service_name} helps {industry} teams address {target_problem} by implementing {automation_type} across systems and teams. It is designed for global organizations that need reliable execution, clear visibility, and scalable delivery. The approach supports phased rollouts and integrates with existing tools to reduce manual work and improve consistency.",
                        'key_outcomes' => [
                            'Reduce manual steps and handoffs',
                            'Improve accuracy and visibility',
                            'Scale operations without linear headcount growth',
                        ],
                    ],
                    'problems' => [
                        ['title' => 'Manual workflows slow operations', 'summary' => 'Repetitive steps and approvals create delays and inconsistent execution.'],
                        ['title' => 'High operational costs', 'summary' => 'Manual effort increases cost per task and limits throughput.'],
                        ['title' => 'Inconsistent data quality', 'summary' => 'Errors and missing information cause rework and unreliable reporting.'],
                        ['title' => 'Limited scalability', 'summary' => 'Volume growth creates bottlenecks across teams and systems.'],
                    ],
                    'solution_bullets' => [
                        ['title' => 'Automate {automation_type}', 'text' => 'Design workflows that reduce friction and keep humans in the loop when needed.'],
                        ['title' => 'Integrate with your stack', 'text' => 'Connect systems using APIs and secure connectors to keep data consistent.'],
                        ['title' => 'Measure outcomes', 'text' => 'Define KPIs upfront and optimize continuously based on real signals.'],
                        ['title' => 'Deploy safely', 'text' => 'Roll out in phases with testing, monitoring, and clear guardrails.'],
                    ],
                    'features' => [
                        ['title' => 'Workflow mapping', 'description' => 'Turn business steps into a clear automation blueprint.', 'icon' => '🧭'],
                        ['title' => 'Integrations', 'description' => 'Connect tools and data sources using APIs and connectors.', 'icon' => '🔗'],
                        ['title' => 'Monitoring', 'description' => 'Track outcomes, failures, and exceptions with alerts.', 'icon' => '📈'],
                        ['title' => 'Governance', 'description' => 'Apply access controls and auditable workflows.', 'icon' => '🛡️'],
                        ['title' => 'Exception handling', 'description' => 'Handle edge cases with human review and retries.', 'icon' => '🧩'],
                        ['title' => 'Scalable delivery', 'description' => 'Expand from quick wins to multi-workflow programs.', 'icon' => '🏗️'],
                    ],
                    'benefits' => [
                        ['title' => 'Increased productivity', 'description' => 'Reduce time spent on repetitive tasks.', 'metric_range' => ''],
                        ['title' => 'Reduced operational costs', 'description' => 'Lower effort per unit of work.', 'metric_range' => ''],
                        ['title' => 'Faster workflows', 'description' => 'Shorten cycle time from request to completion.', 'metric_range' => ''],
                        ['title' => 'Improved data accuracy', 'description' => 'Standardize updates and validations.', 'metric_range' => ''],
                        ['title' => 'Better customer experience', 'description' => 'Improve response times and consistency.', 'metric_range' => ''],
                        ['title' => 'Scalable operations', 'description' => 'Increase capacity without linear headcount growth.', 'metric_range' => ''],
                    ],
                    'use_cases' => [
                        ['title' => 'Automated intake and routing', 'industry' => '{industry}', 'summary' => 'Capture requests, validate data, and route work automatically.'],
                        ['title' => 'Data sync and reconciliation', 'industry' => '{industry}', 'summary' => 'Keep systems aligned with automated checks and exceptions.'],
                        ['title' => 'AI-assisted support workflows', 'industry' => '{industry}', 'summary' => 'Draft replies, surface knowledge, and escalate complex cases.'],
                        ['title' => 'Ops reporting and alerts', 'industry' => '{industry}', 'summary' => 'Generate summaries, detect anomalies, and notify stakeholders.'],
                    ],
                    'process_steps' => [
                        ['title' => 'Business requirement analysis', 'description' => 'Identify workflows, constraints, and success metrics.'],
                        ['title' => 'Workflow design', 'description' => 'Map steps, owners, inputs, and approvals into a plan.'],
                        ['title' => 'Automation development', 'description' => 'Build automations using {tool_stack} and proven patterns.'],
                        ['title' => 'Integration', 'description' => 'Connect systems securely using APIs and connectors.'],
                        ['title' => 'Testing and deployment', 'description' => 'Validate accuracy and performance before rollout.'],
                    ],
                    'tech_stack' => ['OpenAI', 'LangChain', 'Python', 'Node.js', 'Zapier', 'REST APIs'],
                    'industry_applications' => [
                        ['title' => 'Healthcare', 'body' => 'Streamline admin workflows with auditability and controlled access.'],
                        ['title' => 'Finance', 'body' => 'Improve operations with policy-aligned approvals and reporting.'],
                        ['title' => 'SaaS', 'body' => 'Automate onboarding, support, and billing workflows.'],
                        ['title' => 'E-commerce', 'body' => 'Automate orders, inventory updates, and customer messaging.'],
                        ['title' => 'Logistics', 'body' => 'Reduce delays with automated tracking and coordination.'],
                        ['title' => 'Education', 'body' => 'Simplify enrollment, communications, and administration.'],
                    ],
                    'comparison' => [
                        'left_label' => 'Manual Processes',
                        'right_label' => '{service_name}',
                        'rows' => [
                            ['topic' => 'Speed', 'left' => 'Slow handoffs and approvals', 'right' => 'Automated routing with clear escalation'],
                            ['topic' => 'Cost', 'left' => 'Higher labor per task', 'right' => 'Lower effort per unit of work'],
                            ['topic' => 'Accuracy', 'left' => 'Error-prone updates', 'right' => 'Validated inputs and standardized updates'],
                            ['topic' => 'Scalability', 'left' => 'Headcount grows with volume', 'right' => 'Capacity scales through automation'],
                            ['topic' => 'Visibility', 'left' => 'Fragmented reporting', 'right' => 'Centralized metrics and monitoring'],
                        ],
                    ],
                    'roi' => [
                        'highlights' => [
                            ['title' => 'Time saved', 'value' => '{time_saved}', 'note' => 'Measured per workflow baseline'],
                            ['title' => 'Cost reduction', 'value' => '{cost_reduction}', 'note' => 'Lower effort and rework'],
                            ['title' => 'Operational efficiency', 'value' => '{efficiency_gain}', 'note' => 'Faster cycle times and fewer exceptions'],
                        ],
                        'before_after_rows' => [
                            ['metric' => 'Cycle time', 'before' => 'Days', 'after' => 'Hours'],
                            ['metric' => 'Error rate', 'before' => 'Inconsistent', 'after' => 'Reduced'],
                        ],
                    ],
                    'related_services' => [
                        ['title' => 'AI Chatbot Development', 'href' => '/services/ai-chatbots', 'summary' => 'Build chat experiences with guardrails.'],
                        ['title' => 'AI Agent Development', 'href' => '/services/ai-agents', 'summary' => 'Deploy task-driven agents for operations.'],
                        ['title' => 'Workflow Automation', 'href' => '/services/workflow-automation', 'summary' => 'Automate approvals and routing across teams.'],
                        ['title' => 'API Integrations', 'href' => '/services/api-integrations', 'summary' => 'Connect systems reliably with secure integrations.'],
                    ],
                    'faqs' => [
                        ['question' => 'What is {service_name}?', 'short_answer' => 'A service to automate workflows and improve efficiency.', 'expanded_answer' => 'It helps teams reduce manual work, improve consistency, and scale operations with measurable outcomes.'],
                        ['question' => 'Who is it for?', 'short_answer' => '{industry} teams with repeatable processes.', 'expanded_answer' => 'It fits teams that want to improve speed, cost, and accuracy across workflows.'],
                        ['question' => 'How does it integrate?', 'short_answer' => 'Via APIs and connectors.', 'expanded_answer' => 'We connect existing systems and ensure stable operations with monitoring and retries.'],
                        ['question' => 'How long does it take?', 'short_answer' => 'Depends on scope and integrations.', 'expanded_answer' => 'We start with high-impact workflows and expand in phases to reduce risk.'],
                        ['question' => 'Is it secure?', 'short_answer' => 'Security is built into delivery.', 'expanded_answer' => 'We apply least-privilege access and align workflows to your policies.'],
                        ['question' => 'What results can we expect?', 'short_answer' => 'Time saved and fewer errors.', 'expanded_answer' => 'Outcomes are tracked using your KPIs and improved over time.'],
                    ],
                    'seo_expanders' => [
                        ['title' => 'Best {service_name} for small businesses', 'body' => 'Start with one workflow and expand as you scale.'],
                        ['title' => '{service_name} automation tools', 'body' => 'Combine orchestration, integrations, and monitoring for reliability.'],
                        ['title' => 'How {service_name} improves productivity', 'body' => 'Reduce repeat work and standardize execution across teams.'],
                    ],
                    'location' => [
                        'enabled' => false,
                        'headline' => '{service_name} in {country}',
                        'body' => 'Totan.ai supports global delivery and location-specific requirements when needed.',
                    ],
                    'seo' => [
                        'title' => "{$serviceName} | Totan.ai",
                        'canonical_url' => '',
                        'og_title' => "{$serviceName} | Totan.ai",
                        'og_description' => "Improve efficiency with {$serviceName}.",
                    ],
                    'uniqueness' => [
                        'seed' => (string)($context['uniqueness_seed'] ?? ''),
                        'notes' => 'Placeholder content for development.',
                    ],
                ];
            }
        }

        $schema = (string)($context['output_schema'] ?? 'page');
        if ($schema === 'service') {
            $serviceName = (string)($context['service_name'] ?? ($context['primary_keyword'] ?? 'Service'));
            $industry = (string)($context['target_industry'] ?? 'General');

            return [
                'service_name' => '{service_name}',
                'meta_title' => "{$serviceName} for {$industry} | Totan.ai",
                'meta_description' => "SEO-focused {$serviceName} for {$industry}. Automate workflows and improve efficiency with Totan.ai.",
                'hero' => [
                    'headline' => '{service_name} for {industry}',
                    'subheadline' => "Automate {automation_type} to reduce delays and improve operational efficiency.",
                    'short_description' => "Totan.ai delivers {service_name} for {industry} teams to improve speed, quality, and scalability.",
                    'trust_text' => 'Trusted by international teams. Built for measurable outcomes.',
                    'primary_cta_label' => 'Book a Free Consultation',
                    'secondary_cta_label' => 'See Use Cases',
                ],
                'intro' => [
                    'body' => "{service_name} helps {industry} teams address {target_problem} by implementing {automation_type} across systems and teams. It is designed for global organizations that need reliable execution, clear visibility, and scalable delivery. The approach supports phased rollouts and integrates with existing tools to reduce manual work and improve consistency.",
                    'key_outcomes' => [
                        'Reduce manual steps and handoffs',
                        'Improve accuracy and visibility',
                        'Scale operations without linear headcount growth',
                    ],
                ],
                'problems' => [
                    ['title' => 'Manual workflows slow operations', 'summary' => 'Repetitive steps and approvals create delays and inconsistent execution.'],
                    ['title' => 'High operational costs', 'summary' => 'Manual effort increases cost per task and limits throughput.'],
                    ['title' => 'Inconsistent data quality', 'summary' => 'Errors and missing information cause rework and unreliable reporting.'],
                    ['title' => 'Limited scalability', 'summary' => 'Volume growth creates bottlenecks across teams and systems.'],
                ],
                'solution_bullets' => [
                    ['title' => 'Automate {automation_type}', 'text' => 'Design workflows that reduce friction and keep humans in the loop when needed.'],
                    ['title' => 'Integrate with your stack', 'text' => 'Connect systems using APIs and secure connectors to keep data consistent.'],
                    ['title' => 'Measure outcomes', 'text' => 'Define KPIs upfront and optimize continuously based on real signals.'],
                    ['title' => 'Deploy safely', 'text' => 'Roll out in phases with testing, monitoring, and clear guardrails.'],
                ],
                'features' => [
                    ['title' => 'Workflow mapping', 'description' => 'Turn business steps into a clear automation blueprint.', 'icon' => '🧭'],
                    ['title' => 'Integrations', 'description' => 'Connect tools and data sources using APIs and connectors.', 'icon' => '🔗'],
                    ['title' => 'Monitoring', 'description' => 'Track outcomes, failures, and exceptions with alerts.', 'icon' => '📈'],
                    ['title' => 'Governance', 'description' => 'Apply access controls and auditable workflows.', 'icon' => '🛡️'],
                    ['title' => 'Exception handling', 'description' => 'Handle edge cases with human review and retries.', 'icon' => '🧩'],
                    ['title' => 'Scalable delivery', 'description' => 'Expand from quick wins to multi-workflow programs.', 'icon' => '🏗️'],
                ],
                'benefits' => [
                    ['title' => 'Increased productivity', 'description' => 'Reduce time spent on repetitive tasks.', 'metric_range' => ''],
                    ['title' => 'Reduced operational costs', 'description' => 'Lower effort per unit of work.', 'metric_range' => ''],
                    ['title' => 'Faster workflows', 'description' => 'Shorten cycle time from request to completion.', 'metric_range' => ''],
                    ['title' => 'Improved data accuracy', 'description' => 'Standardize updates and validations.', 'metric_range' => ''],
                    ['title' => 'Better customer experience', 'description' => 'Improve response times and consistency.', 'metric_range' => ''],
                    ['title' => 'Scalable operations', 'description' => 'Increase capacity without linear headcount growth.', 'metric_range' => ''],
                ],
                'use_cases' => [
                    ['title' => 'Automated intake and routing', 'industry' => '{industry}', 'summary' => 'Capture requests, validate data, and route work automatically.'],
                    ['title' => 'Data sync and reconciliation', 'industry' => '{industry}', 'summary' => 'Keep systems aligned with automated checks and exceptions.'],
                    ['title' => 'AI-assisted support workflows', 'industry' => '{industry}', 'summary' => 'Draft replies, surface knowledge, and escalate complex cases.'],
                    ['title' => 'Ops reporting and alerts', 'industry' => '{industry}', 'summary' => 'Generate summaries, detect anomalies, and notify stakeholders.'],
                ],
                'process_steps' => [
                    ['title' => 'Business requirement analysis', 'description' => 'Identify workflows, constraints, and success metrics.'],
                    ['title' => 'Workflow design', 'description' => 'Map steps, owners, inputs, and approvals into a plan.'],
                    ['title' => 'Automation development', 'description' => 'Build automations using {tool_stack} and proven patterns.'],
                    ['title' => 'Integration', 'description' => 'Connect systems securely using APIs and connectors.'],
                    ['title' => 'Testing and deployment', 'description' => 'Validate accuracy and performance before rollout.'],
                ],
                'tech_stack' => ['OpenAI', 'LangChain', 'Python', 'Node.js', 'Zapier', 'REST APIs'],
                'industry_applications' => [
                    ['title' => 'Healthcare', 'body' => 'Streamline admin workflows with auditability and controlled access.'],
                    ['title' => 'Finance', 'body' => 'Improve operations with policy-aligned approvals and reporting.'],
                    ['title' => 'SaaS', 'body' => 'Automate onboarding, support, and billing workflows.'],
                    ['title' => 'E-commerce', 'body' => 'Automate orders, inventory updates, and customer messaging.'],
                    ['title' => 'Logistics', 'body' => 'Reduce delays with automated tracking and coordination.'],
                    ['title' => 'Education', 'body' => 'Simplify enrollment, communications, and administration.'],
                ],
                'comparison' => [
                    'left_label' => 'Manual Processes',
                    'right_label' => '{service_name}',
                    'rows' => [
                        ['topic' => 'Speed', 'left' => 'Slow handoffs and approvals', 'right' => 'Automated routing with clear escalation'],
                        ['topic' => 'Cost', 'left' => 'Higher labor per task', 'right' => 'Lower effort per unit of work'],
                        ['topic' => 'Accuracy', 'left' => 'Error-prone updates', 'right' => 'Validated inputs and standardized updates'],
                        ['topic' => 'Scalability', 'left' => 'Headcount grows with volume', 'right' => 'Capacity scales through automation'],
                        ['topic' => 'Visibility', 'left' => 'Fragmented reporting', 'right' => 'Centralized metrics and monitoring'],
                    ],
                ],
                'roi' => [
                    'highlights' => [
                        ['title' => 'Time saved', 'value' => '{time_saved}', 'note' => 'Measured per workflow baseline'],
                        ['title' => 'Cost reduction', 'value' => '{cost_reduction}', 'note' => 'Lower effort and rework'],
                        ['title' => 'Operational efficiency', 'value' => '{efficiency_gain}', 'note' => 'Faster cycle times and fewer exceptions'],
                    ],
                    'before_after_rows' => [
                        ['metric' => 'Cycle time', 'before' => 'Days', 'after' => 'Hours'],
                        ['metric' => 'Error rate', 'before' => 'Inconsistent', 'after' => 'Reduced'],
                    ],
                ],
                'related_services' => [
                    ['title' => 'AI Chatbot Development', 'href' => '/services/ai-chatbots', 'summary' => 'Build chat experiences with guardrails.'],
                    ['title' => 'AI Agent Development', 'href' => '/services/ai-agents', 'summary' => 'Deploy task-driven agents for operations.'],
                    ['title' => 'Workflow Automation', 'href' => '/services/workflow-automation', 'summary' => 'Automate approvals and routing across teams.'],
                    ['title' => 'API Integrations', 'href' => '/services/api-integrations', 'summary' => 'Connect systems reliably with secure integrations.'],
                ],
                'faqs' => [
                    ['question' => 'What is {service_name}?', 'short_answer' => 'A service to automate workflows and improve efficiency.', 'expanded_answer' => 'It helps teams reduce manual work, improve consistency, and scale operations with measurable outcomes.'],
                    ['question' => 'Who is it for?', 'short_answer' => '{industry} teams with repeatable processes.', 'expanded_answer' => 'It fits teams that want to improve speed, cost, and accuracy across workflows.'],
                    ['question' => 'How does it integrate?', 'short_answer' => 'Via APIs and connectors.', 'expanded_answer' => 'We connect existing systems and ensure stable operations with monitoring and retries.'],
                    ['question' => 'How long does it take?', 'short_answer' => 'Depends on scope and integrations.', 'expanded_answer' => 'We start with high-impact workflows and expand in phases to reduce risk.'],
                    ['question' => 'Is it secure?', 'short_answer' => 'Security is built into delivery.', 'expanded_answer' => 'We apply least-privilege access and align workflows to your policies.'],
                    ['question' => 'What results can we expect?', 'short_answer' => 'Time saved and fewer errors.', 'expanded_answer' => 'Outcomes are tracked using your KPIs and improved over time.'],
                ],
                'seo_expanders' => [
                    ['title' => 'Best {service_name} for small businesses', 'body' => 'Start with one workflow and expand as you scale.'],
                    ['title' => '{service_name} automation tools', 'body' => 'Combine orchestration, integrations, and monitoring for reliability.'],
                    ['title' => 'How {service_name} improves productivity', 'body' => 'Reduce repeat work and standardize execution across teams.'],
                ],
                'location' => [
                    'enabled' => false,
                    'headline' => '{service_name} in {country}',
                    'body' => 'Totan.ai supports global delivery and location-specific requirements when needed.',
                ],
                'seo' => [
                    'title' => "{$serviceName} | Totan.ai",
                    'canonical_url' => '',
                    'og_title' => "{$serviceName} | Totan.ai",
                    'og_description' => "Improve efficiency with {$serviceName}.",
                ],
                'uniqueness' => [
                    'seed' => (string)($context['uniqueness_seed'] ?? ''),
                    'notes' => 'Placeholder content for development.',
                ],
            ];
        }

        $industry = $context['target_industry'] ?? 'General';
        $keyword = trim((string)($context['primary_keyword'] ?? 'AI Services'));
        $structureHint = (string)($context['page_structure'] ?? '');

        $lowerKeyword = mb_strtolower($keyword);
        $isContactPage = str_contains($lowerKeyword, 'contact')
            || str_contains($lowerKeyword, 'support')
            || str_contains($lowerKeyword, 'talk to sales')
            || str_contains(mb_strtolower($structureHint), 'contact');

        if ($isContactPage) {
            return [
                'title' => $keyword !== '' ? $keyword : 'Contact Totan.ai',
                'meta_title' => 'Contact Totan.ai | Talk to Our Team',
                'meta_description' => 'Get in touch with the Totan.ai team for demos, pricing, or support. Share your details and we will respond quickly.',
                'sections' => [
                    [
                        'section_key' => 'hero',
                        'content_blocks' => [
                            ['type' => 'heading', 'content' => 'Talk to an AI expert'],
                            ['type' => 'paragraph', 'content' => 'Share a few details about your business and our team will show you exactly how Totan.ai can help.'],
                        ],
                    ],
                    [
                        'section_key' => 'contact_details',
                        'content_blocks' => [
                            ['type' => 'heading', 'content' => 'Ways to reach us'],
                            ['type' => 'list', 'content' => [
                                'Email: hello@totan.ai',
                                'Demo requests: book a 30-minute session',
                                'Support: response within one business day',
                            ]],
                        ],
                    ],
                    [
                        'section_key' => 'cta',
                        'content_blocks' => [
                            ['type' => 'heading', 'content' => 'Ready to see Totan.ai in action?'],
                            ['type' => 'paragraph', 'content' => 'Fill in the form and we will follow up with a tailored walkthrough for your team.'],
                            ['type' => 'button', 'content' => 'Request a demo'],
                        ],
                    ],
                ],
                'faqs' => [
                    [
                        'question' => 'How quickly will someone contact me?',
                        'answer' => 'We usually respond within one business day with next steps or a demo invite.',
                    ],
                    [
                        'question' => 'Can I talk to a real person?',
                        'answer' => 'Yes. Our team will schedule a live session to understand your use case and answer questions.',
                    ],
                ],
                'internal_links' => [
                    ['text' => 'See all solutions', 'url' => '/services'],
                    ['text' => 'Learn about Totan.ai', 'url' => '/about'],
                ],
            ];
        }

        return [
            'title' => "AI Services for {$industry}",
            'meta_title' => "AI Solutions for {$industry} | Totan.ai",
            'meta_description' => "SEO-optimized AI solutions for {$industry}. Improve efficiency, reduce cost, and scale with Totan.ai.",
            'sections' => [
                [
                    'section_key' => 'hero',
                    'content_blocks' => [
                        ['type' => 'heading', 'content' => "AI {$industry} Solutions"],
                        ['type' => 'paragraph', 'content' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'],
                    ],
                ],
                [
                    'section_key' => 'features',
                    'content_blocks' => [
                        ['type' => 'heading', 'content' => 'Key Features'],
                        ['type' => 'list', 'content' => ['Automated Workflows', 'Smart Analytics', '24/7 Support']],
                    ],
                ],
                [
                    'section_key' => 'cta',
                    'content_blocks' => [
                        ['type' => 'heading', 'content' => 'Get Started'],
                        ['type' => 'paragraph', 'content' => 'Request a demo to see how Totan.ai can help your team.'],
                        ['type' => 'button', 'content' => 'Book a Demo'],
                    ],
                ],
            ],
            'faqs' => [
                ['question' => 'What is AI?', 'answer' => 'AI stands for Artificial Intelligence.'],
                ['question' => 'How can it help?', 'answer' => 'It automates tasks and provides insights.'],
            ],
            'internal_links' => [
                ['text' => 'Contact Us', 'url' => '/contact'],
                ['text' => 'Services', 'url' => '/services'],
            ],
        ];
    }
}
