import {
  CodeReview,
  CodeReviewStatus,
  GetCodeReviewResponse,
  GreptileComment,
  GreptileRepository,
  ListCodeReviewsResponse,
  ListPullRequestsResponse,
  MergeRequest,
  PaginationInput,
  PullRequestState,
  RepositoryFilter,
  SearchCommentsResponse,
} from "../types";

type PullRequestInput = RepositoryFilter &
  PaginationInput & {
    state?: PullRequestState;
  };

type CodeReviewInput = RepositoryFilter &
  PaginationInput & {
    prNumber?: number;
    status?: CodeReviewStatus;
  };

type CommentInput = PaginationInput & {
  query: string;
  includeAddressed?: boolean;
};

const repositories: GreptileRepository[] = [
  {
    id: "repo-web-dashboard",
    name: "example-org/web-dashboard",
    remote: "github",
    url: "https://github.com/example-org/web-dashboard",
  },
  {
    id: "repo-api-service",
    name: "example-org/api-service",
    remote: "github",
    url: "https://github.com/example-org/api-service",
  },
  {
    id: "repo-mobile-app",
    name: "example-org/mobile-app",
    remote: "github",
    url: "https://github.com/example-org/mobile-app",
  },
];

const reviewStatuses: CodeReviewStatus[] = [
  "COMPLETED",
  "REVIEWING_FILES",
  "GENERATING_SUMMARY",
  "PENDING",
  "FAILED",
  "SKIPPED",
];

const pullRequestTitles = [
  "Improve checkout error handling",
  "Add audit log export",
  "Refactor repository settings panel",
  "Cache project summary cards",
  "Update billing webhook validation",
  "Simplify onboarding checklist",
  "Add feature flag cleanup job",
  "Improve search result ranking",
  "Move notification preferences",
  "Add API pagination controls",
  "Tighten session refresh logic",
  "Update mobile offline banner",
  "Add repository health indicators",
  "Improve markdown preview states",
  "Reduce dashboard bundle size",
  "Add empty state for filters",
  "Migrate settings routes",
  "Improve invite error messages",
  "Add webhook retry metrics",
  "Refine team access controls",
  "Add comment resolve shortcuts",
  "Improve deployment status polling",
  "Tighten rate limit handling",
  "Add review summary badges",
];

const commentBodies = [
  "This branch introduces a useful guard, but the error path should return a typed result so callers can render a predictable message.",
  "Consider moving this pagination calculation closer to the API wrapper so the list components all share one behavior.",
  "The cache key is derived from user input. Normalize whitespace first so similar searches do not create redundant entries.",
  "This file mixes validation and formatting. Splitting the validation rule would make the failure state easier to test.",
  "The retry path should stop after a bounded number of attempts to avoid keeping the UI in a loading state forever.",
  "This helper silently falls back to an empty list. Returning a warning state would make missing review data easier to diagnose.",
  "The query string is built correctly, but the limit should stay small enough for fast first render in Raycast.",
  "This action should use the platform default copy action label to keep the command consistent with Raycast conventions.",
  "The loading state works, but preserving previous results while the next page loads would reduce visual flicker.",
  "The API response is trusted here. Add a narrow runtime check before reading nested pull request metadata.",
];

const pullRequests: MergeRequest[] = pullRequestTitles.map((title, index) => {
  const repository = repositories[index % repositories.length];
  const number = 420 + index;
  const state = getPullRequestState(index);

  return {
    id: `mock-pr-${number}`,
    number,
    title,
    state,
    isDraft: index % 9 === 0,
    authorLogin: ["alex", "casey", "jordan", "riley"][index % 4],
    branches: {
      source: `feature/mock-${index + 1}`,
      target: "main",
    },
    stats: {
      changedFiles: 2 + (index % 8),
      additions: 24 + index * 7,
      deletions: 3 + index * 2,
    },
    commentsCount: 2 + (index % 6),
    reviewsCount: 1 + (index % 4),
    createdAt: getDate(index + 2),
    updatedAt: getDate(index),
    repository,
    sourceRepoUrl: `${repository.url}/pull/${number}`,
  };
});

const codeReviews: CodeReview[] = pullRequests.map((pullRequest, index) => ({
  id: `mock-review-${pullRequest.number}`,
  status: reviewStatuses[index % reviewStatuses.length],
  createdAt: pullRequest.createdAt,
  completedAt:
    reviewStatuses[index % reviewStatuses.length] === "COMPLETED"
      ? getDate(index)
      : undefined,
  body: [
    `## Review Summary`,
    "",
    `Greptile reviewed ${pullRequest.stats?.changedFiles ?? 0} changed files in ${pullRequest.title}.`,
    "",
    "- The implementation is generally clear and follows the surrounding module boundaries.",
    "- A few comments call out edge cases around loading states, pagination, and predictable error handling.",
  ].join("\n"),
  mergeRequest: {
    id: pullRequest.id,
    prNumber: pullRequest.number,
    number: pullRequest.number,
    title: pullRequest.title,
    sourceRepoUrl: pullRequest.sourceRepoUrl,
    authorLogin: pullRequest.authorLogin,
    repository: pullRequest.repository,
  },
}));

const comments: GreptileComment[] = codeReviews.flatMap((review, reviewIndex) =>
  [0, 1].map((commentIndex) => {
    const body =
      commentBodies[(reviewIndex + commentIndex) % commentBodies.length];
    const lineStart = 18 + reviewIndex * 3 + commentIndex * 5;

    return {
      id: `mock-comment-${review.mergeRequest?.prNumber}-${commentIndex + 1}`,
      commentId: `1000${reviewIndex}${commentIndex}`,
      body,
      authorLogin: "greptile",
      filePath: getFilePath(reviewIndex, commentIndex),
      lineStart,
      lineEnd: lineStart + 2,
      addressed: (reviewIndex + commentIndex) % 3 === 0,
      greptileGenerated: true,
      createdAt: getDate(reviewIndex),
      mergeRequest: {
        id: review.mergeRequest?.id,
        prNumber: review.mergeRequest?.prNumber,
        title: review.mergeRequest?.title,
        sourceRepoUrl: review.mergeRequest?.sourceRepoUrl,
        repository: review.mergeRequest?.repository,
      },
      linkedMemory:
        commentIndex === 0
          ? {
              id: `mock-memory-${reviewIndex}`,
              type: "rule",
              body: "Prefer small, paginated first loads for Raycast list commands.",
            }
          : undefined,
    };
  }),
);

export async function listMockPullRequests(
  input: PullRequestInput = {},
): Promise<ListPullRequestsResponse> {
  const filtered = pullRequests.filter((pullRequest) => {
    return (
      matchesRepository(pullRequest.repository, input) &&
      (!input.state || pullRequest.state === input.state)
    );
  });

  return {
    mergeRequests: paginate(filtered, input),
    total: filtered.length,
  };
}

export async function listMockCodeReviews(
  input: CodeReviewInput = {},
): Promise<ListCodeReviewsResponse> {
  const filtered = codeReviews.filter((review) => {
    const prNumber =
      review.mergeRequest?.prNumber || review.mergeRequest?.number;

    return (
      matchesRepository(review.mergeRequest?.repository, input) &&
      (!input.prNumber || prNumber === input.prNumber) &&
      (!input.status || review.status === input.status)
    );
  });

  return {
    codeReviews: paginate(filtered, input),
    total: filtered.length,
  };
}

export async function getMockCodeReview(
  codeReviewId: string,
): Promise<GetCodeReviewResponse> {
  const codeReview = codeReviews.find((review) => review.id === codeReviewId);

  if (!codeReview) {
    throw new Error(`Mock code review not found: ${codeReviewId}`);
  }

  return { codeReview };
}

export async function searchMockComments(
  input: CommentInput,
): Promise<SearchCommentsResponse> {
  const query = input.query.trim().toLowerCase();
  const filtered = comments.filter((comment) => {
    if (!input.includeAddressed && comment.addressed) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      comment.body,
      comment.filePath,
      comment.mergeRequest?.title,
      comment.mergeRequest?.repository?.name,
    ].some((value) => value?.toLowerCase().includes(query));
  });

  return {
    comments: paginate(filtered, input),
    query: input.query,
    total: filtered.length,
  };
}

function matchesRepository(
  repository: GreptileRepository | undefined,
  input: RepositoryFilter,
) {
  if (!input.name && !input.remote) {
    return true;
  }

  return (
    (!input.name || repository?.name === input.name) &&
    (!input.remote || repository?.remote === input.remote)
  );
}

function paginate<T>(items: T[], input: PaginationInput) {
  const offset = input.offset ?? 0;
  const limit = input.limit ?? 10;

  return items.slice(offset, offset + limit);
}

function getPullRequestState(index: number): PullRequestState {
  if (index % 7 === 0) {
    return "merged";
  }

  if (index % 11 === 0) {
    return "closed";
  }

  return "open";
}

function getDate(daysAgo: number) {
  const date = new Date(Date.UTC(2026, 5, 9, 12, 0, 0));
  date.setUTCDate(date.getUTCDate() - daysAgo);

  return date.toISOString();
}

function getFilePath(reviewIndex: number, commentIndex: number) {
  const paths = [
    "src/api/client.ts",
    "src/components/ReviewList.tsx",
    "src/hooks/usePaginatedResults.ts",
    "src/utils/format.ts",
    "src/commands/search-comments.tsx",
  ];

  return paths[(reviewIndex + commentIndex) % paths.length];
}
