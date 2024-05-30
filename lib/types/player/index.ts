export enum PlayerGroup {
	Normal = 1,
	Tutor,
	Seniortutor,
	Gamemaster,
	Communitymanager,
	God,
}

export enum PlayerSex {
	Female = 0,
	Male,
}

export enum PlayerVocation {
	None = 0,
	Sorcerer,
	Druid,
	Paladin,
	Knight,
	MasterSorcerer,
	ElderDruid,
	RoyalPaladin,
	EliteKnight,
}

interface LoginCharacter {
	worldid: number;
	name: string;
	ismale: boolean;
	tutorial: boolean;
	level: number;
	vocation: string;
	outfitid: number;
	headcolor: number;
	torsocolor: number;
	legscolor: number;
	detailcolor: number;
	addonsflags: number;
	ishidden: number;
	ismaincharacter: boolean;
	dailyrewardstate: number;
}

export function vocationString(playerVocation: PlayerVocation): string {
	return {
		[PlayerVocation.None]: "Sem Vocação",
		[PlayerVocation.Sorcerer]: "Sorcerer",
		[PlayerVocation.Druid]: "Druid",
		[PlayerVocation.Paladin]: "Paladin",
		[PlayerVocation.Knight]: "Knight",
		[PlayerVocation.MasterSorcerer]: "Master Sorcerer",
		[PlayerVocation.ElderDruid]: "Elder Druid",
		[PlayerVocation.RoyalPaladin]: "Royal Paladin",
		[PlayerVocation.EliteKnight]: "Elite Knight",
	}[playerVocation];
}
