import prisma from "@/lib/db";
import { NextRequest } from "next/server";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT_PER_PAGE = 50;
const MAX_LIMIT_PER_PAGE = 100;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const pageParam = Number(searchParams.get('page'));
  const page = pageParam > 0 ? pageParam : DEFAULT_PAGE;

  const limitParam = Number(searchParams.get('limit'));
  const limit = limitParam > 0 ? limitParam : DEFAULT_LIMIT_PER_PAGE;

  const take = Math.min(Number(limit) || DEFAULT_LIMIT_PER_PAGE, MAX_LIMIT_PER_PAGE);

  const skip = (page - 1) * take;

  try {
    const players = await prisma.playerOnline.findMany({
      include: {
        player: {
          select: {
            name: true,
            level: true,
            vocation: true,
          }
        }
      },
      take,
      skip,
    })

    return Response.json(players);
  } catch (error) {
    console.error("Error fetching highscores: ", error);

    return Response.json({
      errorCode: 11,
      errorMessage: 'Error fetching highscores',
    });
  }
}
