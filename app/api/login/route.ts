import { LoginCharacter, LoginParams, Params, PlayerGroup, PlayerSex, vocationString } from "@/lib/types";
import prisma from "@/lib/db";
import { comparePassword } from "@/utils";
import { createHash } from "crypto";
import parseDuration from "parse-duration";

// TODO: Check change password and another things
// export const dynamic = 'force-dynamic'

const SESSION_DURATION = parseDuration(process.env.GAME_SESSION_EXPIRATION_TIME ?? '1d') ?? 3600 * 24;

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
			const data = await handleLogin(params);
			return Response.json(data);
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

async function handleLogin(params: LoginParams) {
	const { email } = params;

	const account = await prisma.accounts.findUnique({
		where: {
			email: email
		},
		include: {
			players: {
				select: {
					name: true,
					sex: true,
					istutorial: true,
					level: true,
					looktype: true,
					vocation: true,
					lookhead: true,
					lookbody: true,
					looklegs: true,
					lookfeet: true,
					lookaddons: true,
					isreward: true,
				}
			}
		}
	})

  if (!account || !params.password || !comparePassword(params.password, account.password)) {
		return {
			errorCode: 3,
			errorMessage: 'Email or password is not correct.',
		};
	}

  let sessionKey: string = crypto.randomUUID();
	const hashedSessionId = createHash('sha1').update(sessionKey).digest('hex');

	if (process.env.DEPRECATED_USE_SHA1_PASSWORDS === 'true') {
		sessionKey = `${params.email}\n${params.password}`;
	} else {
		await prisma.gameAccountSessions.create({
			data: {
				id: hashedSessionId,
				account_id: account.id,
				expires: Math.trunc((Date.now() + SESSION_DURATION) / 1000), // convert to seconds
			},
		});
	}

  const serverPort = parseInt(process.env.SERVER_PORT as string, 10) ?? 7172;
	const pvptype = ['pvp', 'no-pvp', 'pvp-enforced'].indexOf(process.env.PVP_TYPE || 'no-pvp');
	const now = Math.trunc(Date.now() / 1000);

	return {
		session: {
			sessionkey: sessionKey,
			lastlogintime: '0', // TODO: implement last login
			ispremium: process.env.FREE_PREMIUM === 'true' ? true : account.lastday > now,
			premiumuntil: account.lastday,
			status: 'active',
			returnernotification: false,
			showrewardnews: true,
			isreturner: true,
			fpstracking: false,
			optiontracking: false,
			emailcoderequest: false,
		},
		playdata: {
			// TODO: multiple worlds
			worlds: [
				{
					id: 0,
					name: process.env.SERVER_NAME,
					externaladdress: process.env.SERVER_ADDRESS,
					externalport: serverPort,
					externaladdressprotected: process.env.SERVER_ADDRESS,
					externalportprotected: serverPort,
					externaladdressunprotected: process.env.SERVER_ADDRESS,
					externalportunprotected: serverPort,
					previewstate: 0,
					location: 'USA',
					anticheatprotection: false,
					pvptype,
					restrictedstore: false,
				},
			],
			characters: account.players.map(
				(player): LoginCharacter => ({
					worldid: 0,
					name: player.name,
					ismale: player.sex === Number(PlayerSex.Male),
					tutorial: player.istutorial,
					level: player.level,
					vocation: vocationString(player.vocation),
					outfitid: player.looktype,
					headcolor: player.lookhead,
					torsocolor: player.lookbody,
					legscolor: player.looklegs,
					detailcolor: player.lookfeet,
					addonsflags: player.lookaddons,
          // TODO
					//ishidden: player.settings?.hidden ? 1 : 0,
          ishidden: 0,
          //TODO
					//ismaincharacter: player.is_main,
          ismaincharacter: false,
					dailyrewardstate: player.isreward ? 1 : 0,
				}),
			),
		},
	};
}
