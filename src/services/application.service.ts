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

      // 2. Handle Skills in Bulk to avoid sequential database queries
      if (skills && skills.length > 0) {
        // Clean skill names (trim and filter out empty strings)
        const uniqueSkillNames = Array.from(
          new Set(skills.map((s) => s.trim()).filter(Boolean))
        );

        if (uniqueSkillNames.length > 0) {
          // A. Find all existing skills in one single roundtrip
          const existingSkills = await tx.skill.findMany({
            where: { name: { in: uniqueSkillNames } },
          });

          const existingNames = new Set(existingSkills.map((s) => s.name));
          const newSkillNames = uniqueSkillNames.filter((name) => !existingNames.has(name));

          // B. Bulk insert new skills in a single roundtrip
          if (newSkillNames.length > 0) {
            await tx.skill.createMany({
              data: newSkillNames.map((name) => ({ name })),
              skipDuplicates: true,
            });
          }

          // C. Retrieve all skills (existing + newly created) to get their IDs in one single roundtrip
          const allSkills = await tx.skill.findMany({
            where: { name: { in: uniqueSkillNames } },
          });

          // D. Bulk insert all relations in CandidateSkill in a single roundtrip
          await tx.candidateSkill.createMany({
            data: allSkills.map((skill) => ({
              candidateId: candidate.id,
              skillId: skill.id,
            })),
            skipDuplicates: true,
          });
        }
      }

      return candidate;
    }, {
      maxWait: 15000, // 15 seconds to acquire connection
      timeout: 30000  // 30 seconds to execute transaction
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
