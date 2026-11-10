/** Facts that appear in more than one place. Change them here, not in the components. */
export const site = {
  name: "Sangam Patil",
  title: "Sangam Patil · Applied AI Engineer",
  description:
    "Sangam Patil is an Applied AI Engineer and Forward Deployed Engineer building RAG systems, LLM evaluation workflows and MCP tooling. M.S. Data Science, UMass Amherst.",
  roles: ["Applied AI Engineer", "Forward Deployed Engineer"],
  location: "Amherst, MA",
  timezone: "America/New_York",
  email: "hello@sangampatil.com",
  /**
   * Public résumé PDF. Empty hides every "Résumé" button on the site.
   * To turn it on: put the file in /public (for example public/Sangam-Patil-Resume.pdf)
   * and set this to "/Sangam-Patil-Resume.pdf".
   */
  resumeUrl: "",
  links: {
    github: "https://github.com/s-maverick",
    linkedin: "https://www.linkedin.com/in/asangampatil/",
    scholar: "https://scholar.google.com/citations?user=-2fwlMQAAAAJ&hl=en",
    calendly: "https://calendly.com/asangampatil/30min/",
  },
} as const;
