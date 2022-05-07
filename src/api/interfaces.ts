/*
 * @Author: your name
 * @Date: 2022-04-23 23:59:57
 * @LastEditTime: 2022-05-07 09:19:47
 * @LastEditors: MarinaStojmenova marina.stojmenova@hotmail.it
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /personal-website/src/api/interfaces.ts
 */
import {
  validateOrReject,
  IsInt,
  IsString,
  IsUrl,
  IsOptional,
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

  gpx!: string | null;

  // @IsArray()
  // @IsUrl({}, { each: true })
  // gallery!: string[];

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
class Message extends GenericData {
  @IsString()
  name!: string;

  @IsString()
  profilePictureUrl!: string;

  @IsString()
  @IsOptional()
  text: string | undefined;

  @IsUrl()
  @IsOptional()
  imageUrl: string | undefined;

  @IsOptional()
  timestamp: Date | undefined;

  constructor(data: Partial<Message>) {
    super();
    this.imageUrl = undefined;
    this.timestamp = undefined;
    this.text = undefined;
    this.update(data);
    console.log(`Constructed message #${this.timestamp}.`);
  }
}
export { Episode, Season, Message };
