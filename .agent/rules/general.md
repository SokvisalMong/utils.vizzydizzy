---
trigger: always_on
---

<rules>
  <tech_stack>
    <framework version="16.1.6">Next.js</framework>
    <runtime>Bun</runtime>
    <styling>
      <css_library version="4.0+">Tailwind CSS</css_library>
      <ui_library>Shadcn UI</ui_library>
      <icon_library>Tabler Icons</icon_library>
    </styling>
    <language>TypeScript</language>
    <hosting>Vercel</hosting>
  </tech_stack>

<verification_workflow>
<requirement>At the end of any code modification, perform the following validation steps:</requirement>
<commands>
<command>bun run lint</command>
<command>bun run build</command>
</commands>
<instruction>Address all linting errors and build failures before proceeding.</instruction>
</verification_workflow>

<best_practices>
<client_logic_priority>
Prioritize client-side rendering and logic to ensure maximum UI responsiveness. Use server-side components only when essential for SEO, security, or handling large datasets during initial load.
</client_logic_priority>

    <type_safety>
      <rule>Strictly avoid the use of the <code>any</code> type.</rule>
      <rule>Enforce strong type safety using comprehensive TypeScript interfaces or types.</rule>
      <rule>Define all interfaces within the <code>/interfaces</code> directory. Import them as needed; avoid inline definitions.</rule>
    </type_safety>

    <environment_consistency>
      Execute all package management and CLI commands using Bun (e.g., <code>bun [command]</code>, <code>bunx --bun [command]</code>).
    </environment_consistency>

    <project_organization>
      <modularity>Maintain strict code modularity by segregating concerns:</modularity>
      <ui_components>
        <rule>Place reusable UI elements in the <code>/components</code> directory. Use nested subdirectories within <code>/components</code> to group related UI.</rule>
        <rule>Primarily use Shadcn UI components for all UI elements.</rule>
      </ui_components>
      <utility_logic>Place logic functions and helpers in the <code>/utils</code> directory. Use nested subdirectories within <code>/utils</code> to group related functionality.</utility_logic>
    </project_organization>

    <mcp_configurations>
      <allowed_servers>
        <server>shadcn</server>
        <server>next-devtools</server>
      </allowed_servers>
    </mcp_configurations>

</best_practices>
</rules>
