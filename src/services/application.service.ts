import prisma from "../config/db.js";
import { CreateApplicationInput } from "../validators/application.validator.js";

export class ApplicationService {
  async createApplication(data: CreateApplicationInput) {
    const {
      educations,
      experiences,
      projects,
      certifications,
      achievements,
      socialLinks,
      skills,
      ...candidateData
    } = data;

    return await prisma.$transaction(async (tx) => {
      // 1. Create the main Candidate record
      const candidate = await tx.candidate.create({
        data: {
          ...candidateData,
          // Nested creates for simple 1:N relations
          educations: { create: educations },
          experiences: { create: experiences },
          projects: { create: projects },
          certifications: { create: certifications },
          achievements: { create: achievements },
          socialLinks: { create: socialLinks },
        },
      });

      // 2. Handle Skills (Many-to-Many)
      if (skills && skills.length > 0) {
        for (const skillName of skills) {
          // Upsert the skill in the master table
          const skill = await tx.skill.upsert({
            where: { name: skillName },
            update: {},
            create: { name: skillName },
          });

          // Link the skill to the candidate
          await tx.candidateSkill.create({
            data: {
              candidateId: candidate.id,
              skillId: skill.id,
            },
          });
        }
      }

      return candidate;
    }, {
      timeout: 30000
    });
  }

  async getApplications() {
    return await prisma.candidate.findMany({
      include: {
        educations: true,
        experiences: true,
        projects: true,
        certifications: true,
        achievements: true,
        socialLinks: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export default new ApplicationService();
