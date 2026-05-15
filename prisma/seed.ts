import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const universities = [
    { name: "清华大学", program: "计算机科学与技术", websiteUrl: "https://www.cs.tsinghua.edu.cn" },
    { name: "北京大学", program: "计算机科学与技术", websiteUrl: "https://eecs.pku.edu.cn" },
    { name: "浙江大学", program: "计算机科学与技术", websiteUrl: "https://www.cs.zju.edu.cn" },
    { name: "上海交通大学", program: "计算机科学与技术", websiteUrl: "https://www.cs.sjtu.edu.cn" },
    { name: "南京大学", program: "计算机科学与技术", websiteUrl: "https://cs.nju.edu.cn" },
  ];

  for (const u of universities) {
    await prisma.university.upsert({
      where: { name_program: { name: u.name, program: u.program } },
      update: {},
      create: u,
    });
  }

  console.log(`Seeded ${universities.length} universities`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
