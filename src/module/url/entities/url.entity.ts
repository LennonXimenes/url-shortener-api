export class UrlEntity {
  id: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  userId?: string | null;

  constructor(partial: Partial<UrlEntity>) {
    Object.assign(this, partial);
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }
}
