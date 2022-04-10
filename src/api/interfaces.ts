import {
  validateOrReject,
  IsInt,
  IsArray,
  IsString,
  IsUrl,
} from "class-validator";

class GenericData {
  validateOrReject() {
    validateOrReject(this);
  }

  update(data: Partial<Episode>) {
    Object.assign(this, data);
    this.validateOrReject();
  }
}

class Episode extends GenericData {
  @IsString()
  title!: string;

  @IsInt()
  episodeNumber!: number;

  @IsUrl()
  videoUrl!: string;

  @IsString()
  description!: string;

  @IsInt()
  distance!: number;

  @IsInt()
  downhill!: number;

  @IsInt()
  duration!: number;

  @IsInt()
  maxAltitude!: number;

  @IsString()
  summary!: string;

  @IsInt()
  uphill!: number;

  @IsArray()
  @IsUrl({}, { each: true })
  gallery!: string[];

  constructor(data: Partial<Episode>) {
    super();
    this.update(data);
    console.log(`Constructed episode #${this.episodeNumber}-${this.title}.`);
  }
}

class Season extends GenericData {
  @IsInt()
  seasonNumber!: number;

  @IsInt()
  nEpisodes!: number;

  @IsInt()
  year!: number;

  @IsString()
  playlist!: string;

  constructor(data: Partial<Season>) {
    super();
    this.update(data);
    console.log(`Constructed season #${this.seasonNumber}.`);
  }
}

export { Episode, Season };
