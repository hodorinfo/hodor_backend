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
      // 1. Create the main Candidate record (flat insertion to avoid slow sequential nested inserts)
      const candidate = await tx.candidate.create({
        data: candidateData,
      });

      const candidateId = candidate.id;

      // 2. Bulk Insert all child relations to minimize database roundtrips (1 query per table instead of N queries)
      if (educations && educations.length > 0) {
        await tx.education.createMany({
          data: educations.map((e) => ({ ...e, candidateId })),
        });
      }

      if (experiences && experiences.length > 0) {
        await tx.experience.createMany({
          data: experiences.map((e) => ({ ...e, candidateId })),
        });
      }

      if (projects && projects.length > 0) {
        await tx.project.createMany({
          data: projects.map((p) => ({ ...p, candidateId })),
        });
      }

      if (certifications && certifications.length > 0) {
        await tx.certification.createMany({
          data: certifications.map((c) => ({ ...c, candidateId })),
        });
      }

      if (achievements && achievements.length > 0) {
        await tx.achievement.createMany({
          data: achievements.map((a) => ({ ...a, candidateId })),
        });
      }

      if (socialLinks && socialLinks.length > 0) {
        await tx.socialLink.createMany({
          data: socialLinks.map((s) => ({ ...s, candidateId })),
        });
      }

      // 3. Handle Skills in Bulk to avoid sequential database queries
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
              candidateId,
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
