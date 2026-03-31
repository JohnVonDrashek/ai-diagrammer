---
  name: holy-chart
  description: This skill allows you to create software architecture diagrams via holychart. Users will be able to open the charts at holychart.com
---

# HolyChart Diagram Authoring Guide

Use this skill when creating or modifying HolyChart diagrams programmatically — generating `.holychart.json` files or constructing diagram data structures for the ai-diagrammer app.

## File Formats

### Single diagram: `{name}.holychart.json`

```json
{
  "id": "unique-id-string",
  "name": "Diagram Name",
  "elements": [],
  "connections": [],
  "viewport": { "panX": 0, "panY": 0, "zoom": 1, "rotation": 0 }
}
```

### Workspace (multiple diagrams): `workspace.holychart.workplace.json`

The app exports `workspace.holychart.workplace.json` by default and also accepts `workspace.holychart.workspace.json` on import.

```json
{
  "version": 1,
  "diagrams": [ /* array of Diagram objects */ ],
  "activeDiagramId": "id-of-active-diagram"
}
```

## Actual Canvas Semantics

- `x` and `y` are the element's top-left world coordinates, not its center.
- With viewport `{ "panX": 0, "panY": 0, "zoom": 1, "rotation": 0 }`, world `(0,0)` appears near the canvas top-left, not the center.
- Negative coordinates are valid, but they will render offscreen on first import unless you also set viewport pan.
- Element order matters. Boxes do not automatically go behind their children, so grouping boxes should usually appear earlier in the `elements` array than the icons/text they contain.
- Icon labels render below the icon and can be wider than the icon itself. Leave extra vertical and horizontal space.
- Labeled icons take up more visual height than `height` suggests. With the default 16px UI font, a `56x56` icon with a label visually needs about `100px` of total height.
- Text elements are remeasured from their content at render time. Keep `width` and `height` close to the expected text size even though the app can recompute them.
- The current renderer uses the global toolbar font size for displayed text, box titles, icon labels, and connection labels. Per-element `fontSize` values are still stored and used for text measurement/editing, but should not be relied on for mixed-size layouts.

## Element Types

### 1. Icon Element

Displays an SVG icon from the Material Design Icons (MDI) collection.

```json
{
  "id": "icon-1",
  "type": "icon",
  "iconName": "mdi:server",
  "x": 100,
  "y": 200,
  "width": 48,
  "height": 48,
  "label": "Web Server",
  "color": "#4fc3f7"
}
```

- `iconName`: Must use `mdi:icon-name` format (see available icons below)
- `label` (optional): Text shown below the icon
- `color` (optional): Hex color for tinting the icon
- Recommended default size: `48x48` for standard icons, `64x64` for prominent ones

### 2. Text Element

Rich text with markdown support.

```json
{
  "id": "text-1",
  "type": "text",
  "text": "**Title**\nDescription here",
  "x": 300,
  "y": 100,
  "width": 200,
  "height": 40,
  "fontSize": 16,
  "color": "#ffffff"
}
```

- `text`: Supports `**bold**`, `*italic*`, `***bold+italic***`, and `\n` line breaks
- `fontSize`: Number in pixels (common values: 12, 14, 16, 20, 24, 32). Store a reasonable value, but do not rely on it for final rendered size because the app currently renders text using the global font setting.
- `color` (optional): Hex color for text tint
- Width/height auto-adjust to content in the UI, but set reasonable initial values

### 3. Box Element

Container/shape with optional text label.

```json
{
  "id": "box-1",
  "type": "box",
  "text": "API Layer",
  "x": 50,
  "y": 50,
  "width": 300,
  "height": 400,
  "fontSize": 14,
  "style": "dashed",
  "color": "#81c784"
}
```

- `style`: `"solid"` (default), `"dashed"`, or `"filled"`
- `text`: Plain text label displayed at the top-left of the box. Do not rely on markdown formatting here.
- `color` (optional): Affects glow/border color; for `"filled"` style, fills the background
- Use boxes as grouping containers — make them large enough to visually contain child elements
- Put grouping boxes before their child elements in the `elements` array so they render behind the contents

## Connections

Directed arrows between elements.

```json
{
  "id": "conn-1",
  "type": "connection",
  "fromId": "icon-1",
  "toId": "icon-2",
  "label": "HTTP/REST",
  "color": "#ffb74d",
  "style": "solid"
}
```

- `fromId` / `toId`: Must reference valid element IDs
- `style`: `"solid"` (default), `"dashed"`, or `"animated"` (animated dashed line)
- `label` (optional): Plain text shown at the midpoint of the rendered path. Do not rely on markdown formatting here.
- `color` (optional): Hex color for the arrow/line
- Connections attach to element bounds, not their centers, and may auto-curve to separate bidirectional links or avoid icon obstacles

## Available Icons

Use the `mdi:icon-name` format. Common icons by category:

### Infrastructure
| Keyword | Icon Name |
|---------|-----------|
| server | `mdi:server` |
| servers | `mdi:server-network` |
| database / db / mysql | `mdi:database` |
| cloud | `mdi:cloud` |
| storage | `mdi:harddisk` |
| network | `mdi:lan` |
| router | `mdi:router` |
| firewall | `mdi:shield-lock` |
| load balancer | `mdi:scale-balance` |
| cdn / globe / internet | `mdi:earth` |
| dns | `mdi:dns` |
| api / rest | `mdi:api` |
| gateway | `mdi:gate` |
| vpn | `mdi:vpn` |
| kubernetes / k8s | `mdi:kubernetes` |
| docker | `mdi:docker` |
| container | `mdi:package-variant` |
| serverless / function | `mdi:function-variant` |
| lambda | `mdi:lambda` |
| queue | `mdi:tray-full` |
| cache / redis | `mdi:cached` |
| kafka / etl | `mdi:transfer` |

### Clients & Devices
| Keyword | Icon Name |
|---------|-----------|
| client / laptop | `mdi:laptop` |
| browser / web | `mdi:web` |
| mobile | `mdi:cellphone` |
| phone | `mdi:phone` |
| tablet | `mdi:tablet` |
| desktop | `mdi:desktop-classic` |
| iot | `mdi:chip` |
| device | `mdi:devices` |

### Code & Dev
| Keyword | Icon Name |
|---------|-----------|
| code | `mdi:code-tags` |
| git | `mdi:git` |
| github | `mdi:github` |
| ci | `mdi:source-pull` |
| pipeline | `mdi:pipe` |
| deploy | `mdi:rocket-launch` |
| build | `mdi:hammer-wrench` |
| test | `mdi:test-tube` |
| debug | `mdi:bug` |
| monitoring | `mdi:monitor-eye` |
| alert | `mdi:bell-alert` |
| metrics | `mdi:chart-bar` |

### Security
| Keyword | Icon Name |
|---------|-----------|
| security | `mdi:security` |
| lock / https | `mdi:lock` |
| key | `mdi:key` |
| auth | `mdi:shield-key` |
| certificate | `mdi:certificate` |
| vault | `mdi:safe-square` |

### Databases
| Keyword | Icon Name |
|---------|-----------|
| postgresql / postgres | `mdi:elephant` |
| mongodb / mongo | `mdi:leaf` |
| graphql | `mdi:graphql` |

### Languages & Frameworks
| Keyword | Icon Name |
|---------|-----------|
| node | `mdi:nodejs` |
| python | `mdi:language-python` |
| javascript | `mdi:language-javascript` |
| typescript | `mdi:language-typescript` |
| rust | `mdi:language-rust` |
| go | `mdi:language-go` |
| java | `mdi:language-java` |
| react | `mdi:react` |
| vue | `mdi:vuejs` |
| angular | `mdi:angular` |

### Communication & Data
| Keyword | Icon Name |
|---------|-----------|
| email | `mdi:email` |
| message | `mdi:message` |
| chat | `mdi:chat` |
| webhook | `mdi:webhook` |
| notification | `mdi:bell` |
| analytics | `mdi:chart-bar` |
| dashboard | `mdi:view-dashboard` |
| ai / ml | `mdi:brain` |
| user | `mdi:account` |
| users | `mdi:account-group` |

### General
| Keyword | Icon Name |
|---------|-----------|
| settings | `mdi:cog` |
| file | `mdi:file` |
| folder | `mdi:folder` |
| terminal / ssh | `mdi:console` |
| warning | `mdi:alert` |
| error | `mdi:alert-circle` |
| success | `mdi:check-circle` |
| trash | `mdi:trash-can` |

## Layout Guidelines

- **Coordinate system**: `x`/`y` are top-left world coordinates. Positive X is right, positive Y is down.
- **Initial visibility**: For diagrams that should open cleanly with the default viewport, prefer mostly non-negative coordinates and keep the main content near the upper-left region of world space. Only use large negative coordinates when you also set `viewport.panX` / `viewport.panY` intentionally.
- **Spacing**: Keep at least 120px between icon top-left positions for readability. Use more when labels are long.
- **Box padding**: For boxes with a title and labeled icons, leave about `60px` of top padding before the first icon row, about `45px` of bottom padding below the last icon row, and about `30px` of side padding.
- **Row pitch**: For `56x56` labeled icons, use about `110-130px` vertical spacing between rows so labels do not scrape the next row or the box bottom.
- **Grid alignment**: Align elements to a conceptual grid (e.g., multiples of 50px) for clean diagrams.
- **Flow direction**: Left-to-right or top-to-bottom is most readable.
- **Grouping**: Use `box` elements (style `"dashed"` or `"filled"`) to visually group related icons. Make the box large enough to contain child elements and place the box earlier in the `elements` array so it renders underneath them.
- **Labels**: Use icon `label` for short names, but remember labels extend below the icon and can be wider than the icon bounds. Use separate `text` elements for longer descriptions or titles.
- **Connections**: Leave room around dense icon clusters because connections attach to bounding-box edges and labels sit at the midpoint of the final routed path.
- **Auto-size caveat**: The app's quick "box around selection" behavior measures icon rectangles, not the extra label spill below them, so generated diagrams should size boxes manually rather than assuming auto-fit logic will look comfortable.
- **IDs**: Use descriptive, unique IDs like `"web-server"`, `"db-primary"`, `"conn-api-to-db"`.

## Example: Three-Tier Architecture

```json
{
  "id": "three-tier",
  "name": "Three-Tier Architecture",
  "elements": [
    {
      "id": "client",
      "type": "icon",
      "iconName": "mdi:laptop",
      "x": 280,
      "y": 60,
      "width": 48,
      "height": 48,
      "label": "Client"
    },
    {
      "id": "lb",
      "type": "icon",
      "iconName": "mdi:scale-balance",
      "x": 280,
      "y": 180,
      "width": 48,
      "height": 48,
      "label": "Load Balancer"
    },
    {
      "id": "api-box",
      "type": "box",
      "text": "API Layer",
      "x": 80,
      "y": 300,
      "width": 420,
      "height": 160,
      "fontSize": 14,
      "style": "dashed",
      "color": "#4fc3f7"
    },
    {
      "id": "api-1",
      "type": "icon",
      "iconName": "mdi:server",
      "x": 160,
      "y": 360,
      "width": 48,
      "height": 48,
      "label": "API Server 1"
    },
    {
      "id": "api-2",
      "type": "icon",
      "iconName": "mdi:server",
      "x": 360,
      "y": 360,
      "width": 48,
      "height": 48,
      "label": "API Server 2"
    },
    {
      "id": "cache",
      "type": "icon",
      "iconName": "mdi:cached",
      "x": 160,
      "y": 560,
      "width": 48,
      "height": 48,
      "label": "Redis Cache",
      "color": "#ef5350"
    },
    {
      "id": "db",
      "type": "icon",
      "iconName": "mdi:database",
      "x": 360,
      "y": 560,
      "width": 48,
      "height": 48,
      "label": "PostgreSQL",
      "color": "#81c784"
    }
  ],
  "connections": [
    {
      "id": "conn-client-lb",
      "type": "connection",
      "fromId": "client",
      "toId": "lb",
      "label": "HTTPS",
      "style": "solid"
    },
    {
      "id": "conn-lb-api1",
      "type": "connection",
      "fromId": "lb",
      "toId": "api-1",
      "style": "solid"
    },
    {
      "id": "conn-lb-api2",
      "type": "connection",
      "fromId": "lb",
      "toId": "api-2",
      "style": "solid"
    },
    {
      "id": "conn-api1-cache",
      "type": "connection",
      "fromId": "api-1",
      "toId": "cache",
      "label": "Read/Write",
      "style": "dashed"
    },
    {
      "id": "conn-api2-db",
      "type": "connection",
      "fromId": "api-2",
      "toId": "db",
      "label": "SQL",
      "style": "solid"
    },
    {
      "id": "conn-api1-db",
      "type": "connection",
      "fromId": "api-1",
      "toId": "db",
      "style": "dashed"
    }
  ],
  "viewport": { "panX": 0, "panY": 0, "zoom": 1, "rotation": 0 }
}
```

## Common Patterns

### Hub-and-Spoke
Place a central element (e.g., API gateway) at center, with services radiating outward at equal angles.

### Pipeline / Flow
Arrange elements in a line (horizontal or vertical) with sequential connections.

### Layered Architecture
Stack rows of elements vertically: clients at top, load balancers, app servers, databases at bottom. Use dashed boxes to group each layer.

### Microservices
Use a grid layout with each service as an icon. Group related services in dashed boxes. Connect with labeled arrows showing protocols (gRPC, REST, events).

## Tips

- Use `"animated"` connection style for data flow or real-time streams
- Use `"dashed"` connection style for optional or async communication
- Use `"filled"` box style with a subtle color for highlighted/important groups
- Keep viewport at `{ "panX": 0, "panY": 0, "zoom": 1, "rotation": 0 }` only when your diagram is already placed in visible positive space; otherwise set pan intentionally
- Generate unique IDs — use descriptive slugs like `"auth-service"` not numeric IDs
- The app renders on HTML5 Canvas, so elements are positioned in world coordinates and layered by array order
