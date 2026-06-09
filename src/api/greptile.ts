import { callGreptileTool } from "./mcp";
import {
  getMockCodeReview,
  listMockCodeReviews,
  listMockPullRequests,
  searchMockComments,
} from "./mockData";
import { isMockMode } from "../mockMode";
import {
  CodeReviewStatus,
  GetCodeReviewResponse,
  ListCodeReviewsResponse,
  ListPullRequestsResponse,
  PaginationInput,
  PullRequestState,
  Remote,
  RepositoryFilter,
  SearchCommentsResponse,
} from "../types";

type RepositoryInput = RepositoryFilter & PaginationInput;

export type ListPullRequestsInput = RepositoryInput & {
  state?: PullRequestState;
};

export type ListCodeReviewsInput = RepositoryInput & {
  prNumber?: number;
  status?: CodeReviewStatus;
};

export type SearchCommentsInput = PaginationInput & {
  query: string;
  includeAddressed?: boolean;
};

export async function listPullRequests(input: ListPullRequestsInput = {}) {
  if (isMockMode()) {
    console.debug("Using Greptile mock data", {
      tool: "list_pull_requests",
      arguments: normalizeListArguments(input),
    });

    return listMockPullRequests(input);
  }

  return callGreptileTool<ListPullRequestsResponse>(
    "list_pull_requests",
    normalizeListArguments(input),
  );
}

export async function listCodeReviews(input: ListCodeReviewsInput = {}) {
  if (isMockMode()) {
    console.debug("Using Greptile mock data", {
      tool: "list_code_reviews",
      arguments: normalizeListArguments(input),
    });

    return listMockCodeReviews(input);
  }

  return callGreptileTool<ListCodeReviewsResponse>(
    "list_code_reviews",
    normalizeListArguments(input),
  );
}

export async function getCodeReview(codeReviewId: string) {
  if (isMockMode()) {
    console.debug("Using Greptile mock data", {
      tool: "get_code_review",
      arguments: { codeReviewId },
    });

    return getMockCodeReview(codeReviewId);
  }

  return callGreptileTool<GetCodeReviewResponse>("get_code_review", {
    codeReviewId,
  });
}

export async function searchComments(input: SearchCommentsInput) {
  if (isMockMode()) {
    console.debug("Using Greptile mock data", {
      tool: "search_greptile_comments",
      arguments: {
        query: input.query,
        includeAddressed: input.includeAddressed,
        limit: input.limit,
        offset: input.offset,
      },
    });

    return searchMockComments(input);
  }

  return callGreptileTool<SearchCommentsResponse>("search_greptile_comments", {
    query: input.query,
    includeAddressed: input.includeAddressed,
    limit: input.limit,
    offset: input.offset,
  });
}

function normalizeListArguments<T extends RepositoryInput>(input: T) {
  const name = input.name?.trim();
  const args: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (
      key === "name" ||
      key === "remote" ||
      key === "defaultBranch" ||
      key === "remoteUrl"
    ) {
      continue;
    }

    const normalizedValue = normalizeArgumentValue(key, value);

    if (normalizedValue !== undefined) {
      args[key] = normalizedValue;
    }
  }

  if (name) {
    args.name = name;

    const remote = normalizeArgumentValue("remote", input.remote);
    const defaultBranch = normalizeArgumentValue(
      "defaultBranch",
      input.defaultBranch,
    );
    const remoteUrl = normalizeArgumentValue("remoteUrl", input.remoteUrl);

    if (remote) {
      args.remote = remote;
    }

    if (defaultBranch) {
      args.defaultBranch = defaultBranch;
    }

    if (remoteUrl) {
      args.remoteUrl = remoteUrl;
    }
  }

  return args;
}

function normalizeArgumentValue(key: string, value: unknown) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    return trimmedValue || undefined;
  }

  if (typeof value === "number") {
    if (key === "prNumber" && value <= 0) {
      return undefined;
    }

    if (key === "limit" && value <= 0) {
      return undefined;
    }

    if (key === "offset" && value < 0) {
      return undefined;
    }
  }

  return value;
}

export const remoteOptions: Remote[] = ["github", "gitlab"];
