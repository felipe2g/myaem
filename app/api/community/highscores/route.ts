import prisma from "@/lib/db";
import { NextRequest } from "next/server";

// TODO: Filters
// World:	
// All Worlds
// BattleEye:	
// Any World
// Vocation:	
// (all)
// Category:	
// Experience Points
// World Type:	
// Open PvP
// Optional PvP
// Hardcore PvP
// Retro Open PvP
// Retro Hardcore PvP

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

type HighscoresQueryParams = {
  page: number;
  limit: number;
};

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
    const players = await prisma.players.findMany({
      select: {
        name: true,
        level: true,
        vocation: true,
        experience: true,
      },
      take,
      skip,
    });

    return Response.json(players);
  } catch (error) {
    console.error("Error fetching highscores: ", error);

    return Response.json({
      errorCode: 11,
      errorMessage: 'Error fetching highscores',
    });
  }
}
