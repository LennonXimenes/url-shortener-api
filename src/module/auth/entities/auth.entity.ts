import { Exclude, Expose } from "class-transformer";

@Exclude()
export class AuthEntity {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken?: string;

  constructor(partial: Partial<AuthEntity>) {
    Object.assign(this, partial);
  }
}
