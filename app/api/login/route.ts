import { Params, PlayerGroup } from "@/lib/types";
import prisma from "@/lib/db";

// TODO: Check change password and another things
// export const dynamic = 'force-dynamic'

export async function GET() {
	console.error("Unknown login method: GET");
	return Response.json({
		errorCode: 9,
		errorMessage: 'Unknown login method',
	})
}

export async function POST(req: Request) {
	const params = await req.json() as Params;

	switch (params.type) {
		case 'news':
			return Response.json({});
		case 'cacheinfo':
			const cacheInfo = await handleCacheInfo();
			return Response.json(cacheInfo);
		case 'boostedcreature':
			const boostedCreature = await handleBoostedCreature();
			return Response.json(boostedCreature);
		case 'eventschedule':
			return Response.json({});
		case 'login':
		//return json(await handleLogin(params));
		default:
			// eslint-disable-next-line no-case-declarations
			const unknownParams: { type: string } = params;
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			throw new Error(`Unknown login type: ${unknownParams.type}`);
	}
}

async function handleCacheInfo() {
	try {
		const playersonline = await prisma.playerOnline.count({
			where: { player: { group_id: { lt: PlayerGroup.Gamemaster } } },
		});

		return {
			playersonline,
			twitchstreams: 0,
			twitchviewer: 0,
			gamingyoutubestreams: 0,
			gamingyoutubeviewer: 0,
		};
	} catch (error) {
		console.error("Error fetching boosted creature or boss: ", error);
		return Response.json({
			errorCode: 10,
			errorMessage: 'Error fetching info',
		})
	}
}


async function handleBoostedCreature() {
	try {
		const [boostedCreature, boostedBoss] = await Promise.all([
			prisma.boostedCreature.findFirstOrThrow({
				select: { raceid: true },
			}),
			prisma.boostedBoss.findFirstOrThrow({
				select: { raceid: true },
			}),
		]);

		const { raceid: creatureRaceId } = boostedCreature;
		const { raceid: bossRaceId } = boostedBoss;

		return {
			boostedcreature: true,
			creatureraceid: Number(creatureRaceId),
			bossraceid: Number(bossRaceId),
		};
	} catch (error) {
		console.error("Error fetching boosted creature or boss: ", error);
		return Response.json({
			errorCode: 11,
			errorMessage: 'Error fetching boosted creature or boss',
		})
	}
}