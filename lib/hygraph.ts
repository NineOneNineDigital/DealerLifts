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

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(READ_TOKEN ? { Authorization: `Bearer ${READ_TOKEN}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: options?.revalidate ?? 60 },
  });

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
  id: string;
  name: string;
  slug: string;
  title: string | null;
  image: string | null;
  bio: { html: string; text: string } | null;
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
  id: string;
  name: string;
  slug: string;
  year: number | null;
  make: string | null;
  model: string | null;
  mainImage: string | null;
  images: string[] | null;
  featuredProject: boolean | null;
  projectDetails: { html: string; text: string } | null;
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
