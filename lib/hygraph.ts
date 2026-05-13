const ENDPOINT = process.env.HYGRAPH_CONTENT_API_URL;
const READ_TOKEN = process.env.HYGRAPH_CONTENT_API_READ_TOKEN;

export async function hygraphFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { revalidate?: number }
): Promise<T> {
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

const COMPLETED_PROJECT_BY_SLUG_QUERY = /* GraphQL */ `
  query CompletedProjectBySlug($slug: String!) {
    completedProject(where: { slug: $slug }) {
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

export async function getCompletedProjectBySlug(
  slug: string
): Promise<CompletedProject | null> {
  const data = await hygraphFetch<{
    completedProject: CompletedProject | null;
  }>(COMPLETED_PROJECT_BY_SLUG_QUERY, { slug });
  return data.completedProject;
}
