<p align="center">
    <img src="./assets/greptile-icon.png" width="150" height="150" />
</p>

# Greptile

_Browse Greptile pull requests, code reviews, and review comments from Raycast._

Use this extension to inspect Greptile review activity, search past feedback, and ask Raycast AI about Greptile review data.

This extension is not affiliated with, endorsed by, or sponsored by Greptile.

Built on the day following Greptile's visit to Tokyo in Ebisu on June 8th, 2026 at Tap & Tumbler. May it be useful for the community. The war on bugs continues 🍻

## Features

- List pull requests known to Greptile.
- List Greptile code review runs.
- Search Greptile review comments.
- Open pull requests and comments in the browser.
- Copy review/comment content from Raycast actions.
- Ask Raycast AI about pull requests, code reviews, and comments using the included AI tools.

## Testing the AI Tools

In Raycast AI, try:

```text
@greptile search comments about pagination
```

Other useful prompts:

- `@greptile show me recent open pull requests`
- `@greptile list completed code reviews`
- `@greptile do we have failed reviews?`

To run the extension evals locally:

```bash
npm run build
npx ray evals --skipBuild
```

## Future Features

Greptile's current MCP API also exposes:

- Custom context: list, get, search, and create team coding patterns or instructions.
- Pull requests: get detailed pull request data and list pull request comments.
- Code reviews: get detailed review summaries and trigger new reviews.
- Comments: search Greptile review feedback.

For the most up-to-date API surface, see Greptile's [MCP Tool Reference](https://www.greptile.com/docs/mcp/tool-reference) and [MCP Overview](https://www.greptile.com/docs/mcp/overview).

Potential upgrades for this extension:

- Add repository, remote, branch, PR number, and status filters in the command UI.
- Add pull request detail views backed by Greptile's detailed pull request endpoint.
- Add a command for PR-specific comments with addressed and Greptile-generated filters.
- Add custom context commands for browsing and searching team rules.
- Add a guarded action to trigger a Greptile code review from Raycast.
- Add menu bar summaries for recent failed or pending reviews.
- Improve performance with persisted lightweight caches and clearer loading states.
