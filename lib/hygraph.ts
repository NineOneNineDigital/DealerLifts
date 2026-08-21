/**
 * Statuses worth retrying: Hygraph rate limiting, plus transient gateway
 * errors. Everything else (4xx misconfiguration, auth) fails immediately —
 * retrying those just delays a certain failure.
 */
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

/** Backoff before each retry, in milliseconds. Length sets the retry count. */
export const RETRY_DELAYS_MS = [300, 900, 2400];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * How long to wait before retry `attempt`, honouring a server Retry-After
 * header when present (seconds form; the HTTP-date form is rare and falls
 * through to backoff).
 */
function retryDelay(res: Response, attempt: number): number {
  const header = res.headers?.get?.("retry-after");
  const seconds = header ? Number.parseInt(header, 10) : Number.NaN;
  return Number.isNaN(seconds) ? RETRY_DELAYS_MS[attempt] : seconds * 1000;
}

export async function hygraphFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { revalidate?: number }
): Promise<T> {
  const ENDPOINT = process.env.HYGRAPH_CONTENT_API_URL;
  const READ_TOKEN = process.env.HYGRAPH_CONTENT_API_READ_TOKEN;

  if (!ENDPOINT) {
    throw new Error(
      "HYGRAPH_CONTENT_API_URL is not set. Add it to .env.local."
    );
  }

  const request = () =>
    fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(READ_TOKEN ? { Authorization: `Bearer ${READ_TOKEN}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: options?.revalidate ?? 60 },
    });

  /*
   * A cold-cache production build renders every page in parallel workers, so
   * the first requests burst at Hygraph together and can trip its rate limit.
   * Without this, a deploy fails on a 429 that would have succeeded a second
   * later — and under HYGRAPH_STRICT that takes the whole build down.
   */
  let res = await request();

  for (
    let attempt = 0;
    attempt < RETRY_DELAYS_MS.length && RETRYABLE_STATUSES.has(res.status);
    attempt++
  ) {
    await sleep(retryDelay(res, attempt));
    res = await request();
  }

  if (!res.ok) {
    throw new Error(`Hygraph request failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (json.errors?.length) {
    throw new Error(
      `Hygraph GraphQL error: ${json.errors.map((e) => e.message).join("; ")}`
    );
  }

  if (!json.data) {
    throw new Error("Hygraph returned no data");
  }

  return json.data;
}

/**
 * Non-throwing wrapper around {@link hygraphFetch} for page content.
 *
 * Page content merges over typed code defaults, so a CMS failure should
 * degrade rather than 500 — except during CI builds, where shipping defaults
 * in place of published copy silently reverts the site. `HYGRAPH_STRICT=1`
 * makes the build fail loudly instead.
 *
 * Collection accessors (jobs, team, projects) keep using the throwing
 * `hygraphFetch`, where an empty list is worse than a visible error.
 */
export async function hygraphFetchSafe<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { revalidate?: number }
): Promise<T | null> {
  try {
    return await hygraphFetch<T>(query, variables, options);
  } catch (error) {
    if (process.env.HYGRAPH_STRICT === "1") {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `[hygraph] content fetch failed, falling back to defaults: ${message}`
    );
    return null;
  }
}

export interface JobPosition {
  id: string;
  jobDescription: { html: string; text: string } | null;
  jobType: string | null;
  location: string | null;
  name: string;
  slug: string;
  workTime: string | null;
}

const JOB_POSITIONS_QUERY = /* GraphQL */ `
  query JobPositions {
    jobPositions(orderBy: createdAt_DESC) {
      id
      name
      slug
      location
      jobType
      workTime
      jobDescription {
        html
        text
      }
    }
  }
`;

export async function getJobPositions(): Promise<JobPosition[]> {
  const data = await hygraphFetch<{ jobPositions: JobPosition[] }>(
    JOB_POSITIONS_QUERY
  );
  return data.jobPositions;
}

export interface TeamMember {
  bio: { html: string; text: string } | null;
  id: string;
  image: string | null;
  name: string;
  slug: string;
  title: string | null;
}

const TEAM_MEMBERS_QUERY = /* GraphQL */ `
  query TeamMembers {
    teamMembers(orderBy: sort_ASC) {
      id
      name
      slug
      title
      image
      bio {
        html
        text
      }
    }
  }
`;

export async function getTeamMembers(): Promise<TeamMember[]> {
  const data = await hygraphFetch<{ teamMembers: TeamMember[] }>(
    TEAM_MEMBERS_QUERY
  );
  return data.teamMembers;
}

export interface CompletedProject {
  featuredProject: boolean | null;
  id: string;
  images: string[] | null;
  mainImage: string | null;
  make: string | null;
  model: string | null;
  name: string;
  projectDetails: { html: string; text: string } | null;
  slug: string;
  year: number | null;
}

const COMPLETED_PROJECTS_QUERY = /* GraphQL */ `
  query CompletedProjects {
    completedProjects(orderBy: year_DESC, first: 100) {
      id
      name
      slug
      year
      make
      model
      mainImage
      images
      featuredProject
      projectDetails {
        html
        text
      }
    }
  }
`;

export async function getCompletedProjects(): Promise<CompletedProject[]> {
  const data = await hygraphFetch<{ completedProjects: CompletedProject[] }>(
    COMPLETED_PROJECTS_QUERY
  );
  return data.completedProjects;
}

export async function getCompletedProjectBySlug(
  slug: string
): Promise<CompletedProject | null> {
  const projects = await getCompletedProjects();
  return projects.find((p) => p.slug === slug) ?? null;
}
